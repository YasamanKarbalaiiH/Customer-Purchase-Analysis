
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from main import (
    get_step_one_summary,
    get_step_seven_summary,
    get_step_two_summary,
    get_step_three_summary,
    get_step_four_summary,
    get_step_five_summary,
    get_step_six_summary,
    get_step_eight_summary
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
@app.get("/api/step-four")
def step_four():
    try:
        return get_step_four_summary()
    except Exception as error :
        raise HTTPException(
                    status_code=500,
                    detail=str(error)
        )
@app.get("/api/step-five")
def step_five():
    try:
        return get_step_five_summary()
    except Exception as error :
        raise HTTPException(
                    status_code=500,
                    detail=str(error)
        )

@app.get("/api/step-six")
def step_six():
    try:
        return get_step_six_summary()
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@app.get("/api/step-seven")
def step_seven():
    try:
        return get_step_seven_summary()
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@app.get("/api/step-eight")
def step_eight():
    try:
        return get_step_eight_summary()
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))