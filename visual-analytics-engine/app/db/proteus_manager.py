import asyncio
import os
import sys

import jaydebeapi
import pandas as pd

from db.db_manager import DBManager
from db.jaydebeapi_extended import ExtendedCursor, ExtendedDictCursor


class ProteusManager(DBManager):
    __database_url = None
    __user = None
    __password = None

    __connection = None

    def __init__(self, database_url, user, password):
        self.__database_url = database_url
        self.__user = user
        self.__password = password

        # self.__connect()

    def __connect(self):
        if self.__connection is None:
            try:
                self.__connection = jaydebeapi.connect(jclassname='org.apache.calcite.avatica.remote.Driver',
                                                       url=f'jdbc:avatica:remote:url={self.__database_url};serialization=PROTOBUF',
                                                       driver_args=[self.__user,
                                                                    self.__password],
                                                       jars=os.environ['AVATICA_JAR'])

                print("[OK] Connected to Proteus database.", file=sys.stderr)
            except Exception as e:
                print("[ERR] Failed to connect to Proteus instance.", str(e), file=sys.stderr)

    async def query_schema(self, table_names=None):
        self.__connect()

        with ExtendedCursor(self.__connection) as cur:
            cur.meta_get_tables()
            row_headers = cur.get_column_names()
            rows = cur.fetchall()

            tables = [row[row_headers.index("TABLE_NAME")] for row in rows]

            # Filter internal tables of Proteus instance
            tables = filter(lambda t: not (str(t).startswith("tempraw") or str(t) == "SessionTimings"), tables)

            if table_names and (isinstance(table_names, list) or isinstance(table_names, tuple)):
                tables = [tn for tn in table_names if tn in tables]

            schemata = await asyncio.wait([self.__query_schema_for_table(table) for table in tables])

            return {table: schema for table, schema in zip(tables, schemata)}

    async def __query_schema_for_table(self, table_name):
        with ExtendedCursor(self.__connection) as cur:
            cur.meta_get_columns(table_name)
            row_headers = cur.get_column_names()
            rows = cur.fetchall()

            column_names = [row[row_headers.index("COLUMN_NAME")] for row in rows]
            data_types = [row[row_headers.index("TYPE_NAME")] for row in rows]

            # Replace with pydantic_models that are readable
            def simplify_type(t):
                _t = str(t).lower()

                # Replace complex pydantic_models
                if _t.startswith("recordtype"):
                    start_pos = _t.find("(")
                    end_pos = start_pos
                    count_brackets = 0
                    for end_pos in range(start_pos, len(_t)):
                        if _t[end_pos] == '(':
                            count_brackets += 1
                        elif _t[end_pos] == ')':
                            count_brackets -= 1

                        if count_brackets == 0:
                            break
                    simplified_type = _t[:start_pos] + _t[(end_pos + 1):]
                    return simplified_type
                if _t.startswith("varchar"):
                    return "varchar"
                return _t

            data_types = list(map(simplify_type, data_types))

            columns = [{"column_name": cn, "data_type": ct} for (cn, ct) in zip(column_names, data_types)]

            return columns

    async def query_table(self, table_name, columns=None, max_rows=100):
        self.__connect()

        with ExtendedDictCursor(self.__connection) as cur:
            if columns and (isinstance(columns, list) or isinstance(columns, tuple)):
                columns_str = ",".join(list(map(lambda s: s + " as " + s, columns)))

                # @TS: Yes, I know this is not safe and prone to SQL injections. However, it
                #      seems that phoenixdb does not support SQL composition with identifiers.
                query = f"select {columns_str} from {table_name}"
                if max_rows:
                    query += f" limit {max_rows}"
                cur.execute(query)
            else:
                query = f"select * from {table_name}"
                if max_rows:
                    query += f" limit {max_rows}"

            rows = cur.fetchall()
            df = pd.DataFrame(rows)

            return df
