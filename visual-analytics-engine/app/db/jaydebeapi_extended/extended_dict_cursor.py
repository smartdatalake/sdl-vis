from .extended_cursor import ExtendedCursor


class ExtendedDictCursor(ExtendedCursor):
    def __init__(self, connection):
        super().__init__(connection)

    def fetchone(self):
        col_names = self.get_column_names()
        row = super().fetchone()

        if row is not None:
            return dict(zip(col_names, row))

        # All result rows are consumed.
        return None
