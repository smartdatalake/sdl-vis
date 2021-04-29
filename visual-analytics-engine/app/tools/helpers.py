import traceback as tb
from typing import Dict


def exception_to_success_message(e: Exception, debug=False) -> Dict:
    formatted_exception = {
        "success": False,
        "errorMessage": str(e),
    }

    if debug:
        formatted_exception["traceback"] = ''.join(tb.format_exception(None, e, e.__traceback__))

    return formatted_exception
