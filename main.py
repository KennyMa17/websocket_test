from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()

# Allow all CORS origins for testing (change in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def fibonacci(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-2)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        counter = 0
        # Receive the starting number from the frontend
        start_number = int(await websocket.receive_text())
        
        current_number = start_number
        while current_number >= 0:
            await websocket.send_text(str(current_number))  # Send the current number to the frontend
            await asyncio.sleep(1)  # Wait for 1 second before sending the next number
            current_number -= 1
            counter += 1
        
    except WebSocketDisconnect:
        print("WebSocket connection closed by client")

