"""Check the generated static site, including routes, canonicals and JSON-LD.

Run after building: python scripts/check_seo.py
Only the Python standard library is required.
"""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from xml.etree import ElementTree


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.ids = []
        self.title = ""
        self.schema = []
        self._title = False
        self._head = False
        self._schema = False
        self._script = ""
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "head":
            self._head = True
        if tag == "title" and self._head:
            self._title = True
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._schema = True
            self._script = ""

    def handle_endtag(self, tag):
        if tag == "head":
            self._head = False
        if tag == "title":
            self._title = False
        if tag == "script" and self._schema:
            self.schema.append(json.loads(self._script))
            self._schema = False

    def handle_data(self, data):
        if self._title:
            self.title += data
        if self._schema:
            self._script += data

    def select(self, tag, **attrs):
        return [a for t, a in self.tags if t == tag and all(a.get(k) == v for k, v in attrs.items())]


root = Path(__file__).resolve().parents[1] / "dist"
pages = {path.relative_to(root).as_posix(): Page(path.read_text(encoding="utf-8")) for path in root.rglob("index.html")}
assert len(pages) == 5, f"Expected homepage and four services; found {len(pages)}"
canonicals, titles, descriptions = set(), set(), set()
page_by_path = {}

for filename, page in pages.items():
    assert page.select("html", lang="es-CL"), filename
    assert len(page.select("h1")) == 1, f"{filename}: expected one H1"
    assert len(page.select("main")) == 1, f"{filename}: expected one main landmark"
    assert len(page.ids) == len(set(page.ids)), f"{filename}: duplicate IDs"
    canonical_tags = page.select("link", rel="canonical")
    assert len(canonical_tags) == 1, f"{filename}: expected one canonical"
    canonical = canonical_tags[0]["href"]
    parts = urlsplit(canonical)
    assert parts.scheme == "https" and parts.netloc and parts.path.endswith("/") and not parts.query and not parts.fragment, canonical
    expected_path = filename.removesuffix("index.html")
    assert parts.path.endswith(expected_path), f"{filename}: canonical points to another page"
    assert canonical not in canonicals, f"{filename}: duplicate canonical"
    canonicals.add(canonical)
    page_by_path[parts.path] = page
    assert page.title and page.title not in titles, f"{filename}: missing or duplicate title"
    titles.add(page.title)
    description = page.select("meta", name="description")[0]["content"]
    assert description and description not in descriptions, f"{filename}: missing or duplicate description"
    descriptions.add(description)
    robots = page.select("meta", name="robots")[0]["content"]
    assert "noindex" not in robots and "nofollow" not in robots, f"{filename}: blocked indexing"
    assert page.select("meta", property="og:url")[0]["content"] == canonical, filename
    assert len(page.schema) == 1, f"{filename}: expected JSON-LD graph"
    graph = page.schema[0]["@graph"]
    entities = {item["@type"]: item for item in graph}
    company = entities["GeneralContractor"]
    assert company["telephone"] == "+56935172731" and company["address"]["addressLocality"] == "Angol", filename
    assert entities["WebPage"]["url"] == canonical, filename
    if filename != "index.html":
        assert entities["Service"]["provider"]["@id"] == company["@id"], filename
        crumbs = entities["BreadcrumbList"]["itemListElement"]
        assert [item["position"] for item in crumbs] == [1, 2] and crumbs[-1]["item"] == canonical, filename
        assert len(page.select("details")) >= 4, f"{filename}: missing useful FAQ content"
    assert not any(item["@type"] in ("Review", "AggregateRating") for item in graph), filename
    print(f"OK metadata, headings, static FAQ and JSON-LD: {filename}")

home = pages["index.html"].select("link", rel="canonical")[0]["href"]
origin = urlsplit(home).netloc
base = urlsplit(home).path
internal_links = 0
for filename, page in pages.items():
    canonical = page.select("link", rel="canonical")[0]["href"]
    for link in page.select("a"):
        href = link.get("href", "")
        target = urlsplit(urljoin(canonical, href))
        if target.netloc != origin or target.scheme not in ("http", "https"):
            continue
        assert target.path.startswith(base), f"{filename}: link escapes project base: {href}"
        if target.path in page_by_path:
            if target.fragment and not target.fragment.startswith("planifica="):
                assert unquote(target.fragment) in page_by_path[target.path].ids, f"{filename}: missing anchor: {href}"
            internal_links += 1
        else:
            assert (root / unquote(target.path.removeprefix(base))).is_file(), f"{filename}: broken link: {href}"
    for image in page.select("img"):
        assert "alt" in image and image.get("width") and image.get("height"), f"{filename}: missing image attributes"
        path = urlsplit(urljoin(canonical, image["src"])).path
        assert path.startswith(base) and (root / unquote(path.removeprefix(base))).is_file(), f"{filename}: broken image"

sitemap = ElementTree.parse(root / "sitemap.xml")
locations = [node.text for node in sitemap.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
assert set(locations) == canonicals and len(locations) == len(canonicals), "Sitemap differs from canonical pages"
assert f"Sitemap: {home}sitemap.xml" in (root / "robots.txt").read_text(), "Wrong sitemap URL in robots"
print(f"OK {internal_links} internal links, images and anchors; sitemap contains {len(locations)} canonical URLs.")
print("NOTE: project robots.txt does not control the GitHub host root. Indexation and field performance require external tools.")
