
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from main import (
    get_step_one_summary,
    get_step_two_summary,
    get_step_three_summary
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/api/step-one")
def step_one():
    try:
        return get_step_one_summary()

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
@app.get("/api/step-two")
def step_two():
    try:
        return get_step_two_summary()

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
@app.get("/api/step-three")
def step_three():
    try:
        return get_step_three_summary()

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )