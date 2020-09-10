from abc import ABC, abstractmethod


class DBManager(ABC):
    @abstractmethod
    def query_schema(self, table_name=None):
        pass

    @abstractmethod
    def query_table(self, table_name, columns=None, max_rows=100):
        pass
