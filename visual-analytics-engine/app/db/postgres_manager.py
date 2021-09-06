import sys

import pandas as pd
import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor

from db.db_manager import DBManager


class PostgresManager(DBManager):
    __database = None
    __user = None
    __password = None
    __host = None
    __port = None

    __connection = None

    def __init__(self, database, user, password, host="127.0.0.1", port=5432):
        self.__database = database
        self.__user = user
        self.__password = password
        self.__host = host
        self.__port = port
        self.__connection = None

        self.__connect()

    def __connect(self):
        if self.__connection is None:
            try:
                self.__connection = psycopg2.connect(
                    database=self.__database,
                    user=self.__user,
                    password=self.__password,
                    host=self.__host,
                    port=self.__port)

                print("[OK] Connected to Postgres database.", file=sys.stderr)
            except:
                print("[ERR] Failed to connect to Postgres database.", file=sys.stderr)

    async def query_schema(self, table_names=None):
        self.__connect()

        with self.__connection.cursor() as cur:
            if table_names and (isinstance(table_names, list) or isinstance(table_names, tuple)):
                table_names = tuple(table_names)

                cur.execute("""SELECT table_name, column_name, data_type
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE table_schema = 'public'
                    AND table_name in %s""",
                            [table_names])
            else:
                cur.execute("""SELECT table_name, column_name, data_type
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE table_schema = 'public'
                    ORDER BY table_name""")

            rows = cur.fetchall()

            table_dict = {}
            for row in rows:
                if row[0] not in table_dict:
                    table_dict[row[0]] = []

                table_dict[row[0]].append({"column_name": row[1],
                                           "data_type": row[2]})

            return table_dict

    async def query_table(self, table_name, columns=None, max_rows=100):
        self.__connect()

        with self.__connection.cursor(cursor_factory=RealDictCursor) as cur:
            if columns and isinstance(columns, list):
                query = sql.SQL("select {fields} from {table} limit {limit}").format(
                    fields=sql.SQL(', ').join([sql.Identifier(c) for c in columns]),
                    table=sql.Identifier(table_name),
                    limit=sql.Literal(max_rows)
                )
                cur.execute(query)
            else:
                query = sql.SQL("select * from {table} limit {limit}").format(
                    table=sql.Identifier(table_name),
                    limit=sql.Literal(max_rows)
                )
                cur.execute(query)

            rows = cur.fetchall()
            df = pd.DataFrame(rows)

            return df
