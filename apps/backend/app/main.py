from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import uvicorn

from .base import create_app

app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        access_log=True,
        use_colors=False,
        # Force HTTP/1.1 to avoid ALPN negotiation issues in development
        http="auto",
        # Add timeouts for better development experience
        timeout_keep_alive=300,
        timeout_graceful_shutdown=300,
    )
