import jaydebeapi


class ExtendedCursor(jaydebeapi.Cursor):
    def __init__(self, connection):
        super().__init__(connection, connection._converters)

    def meta_get_table_types(self):
        self._rs = self._connection.jconn.getMetaData().getTableTypes()

        self._meta = self._rs.getMetaData()
        self.rowcount = -1

    def meta_get_tables(self):
        self._rs = self._connection.jconn.getMetaData().getTables(None,
                                                                  None,
                                                                  None,
                                                                  ['TABLE'])
        self._meta = self._rs.getMetaData()
        self.rowcount = -1

    def meta_get_views(self):
        self._rs = self._connection.jconn.getMetaData().getTables(None,
                                                                  None,
                                                                  None,
                                                                  ['VIEWS'])
        self._meta = self._rs.getMetaData()
        self.rowcount = -1

    def meta_get_columns(self, table_name):
        self._rs = self._connection.jconn.getMetaData().getColumns(None,
                                                                   None,
                                                                   table_name,
                                                                   None)
        self._meta = self._rs.getMetaData()
        self.rowcount = -1

    def get_column_names(self):
        """Fetch the column headers for the executed query."""
        return [self._meta.getColumnName(i) for i in range(1, self._meta.getColumnCount() + 1)]
