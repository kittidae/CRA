import feedparser

def get_news():
    url = "https://news.google.com/rss/search?q=เกษตร+ไทย&hl=th&gl=TH&ceid=TH:th"

    feed = feedparser.parse(url)

    news = []

    for entry in feed.entries[:10]:
        news.append({
            "title": entry.title,
            "date": getattr(entry, "published", "")
        })

    return news