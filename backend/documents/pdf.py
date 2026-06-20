import asyncio
from weasyprint import HTML


async def render_pdf(html: str) -> bytes:
    """Convert an HTML string to PDF bytes. Runs WeasyPrint in a thread
    executor so it doesn't block the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, lambda: HTML(string=html).write_pdf())
