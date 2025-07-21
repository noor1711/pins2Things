from flask import jsonify


ERRORS = {
    "TOO_MANY_REQUESTS": {
        "status": 429,
        "message": "You have reached the maximum number of requests allowed. Please try again later."
    },
    "PINTEREST_UNAUTHORIZED": {
        "status": 401,
        "message": "You are not authorized to access this Pinterest board. Redirecting..."
    },
    "UNKNOWN_ERROR": {
        "status": 500,
        "message": "An unknown error occurred. Please try again later."
    }
}

def get_jsonified_error(error_name):
    if error_name in ERRORS:
        error = ERRORS[error_name]
    else:
        error = ERRORS["UNKNOWN_ERROR"]
    return jsonify({ "error": error["message"] }), error["status"]
