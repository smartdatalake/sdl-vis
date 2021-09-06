import traceback as tb
from typing import Dict


def exception_to_status_message(e: Exception, debug=False) -> Dict:
    formatted_exception = {
        "success": False,
        "errorMessage": str(e),
    }

    if debug:
        formatted_exception["traceback"] = ''.join(tb.format_exception(None, e, e.__traceback__))

    return formatted_exception


# For compatibily with Python 3.7; in Python 3.9+ there is a str.removeprefix method.
def remove_prefix(text, prefix):
    return text[text.startswith(prefix) and len(prefix):]
