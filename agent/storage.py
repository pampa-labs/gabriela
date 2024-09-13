from abc import ABC, abstractmethod
from tinydb import TinyDB, Query
import os

class StorageStrategy(ABC):
    @abstractmethod
    def add_expense(self, expense: dict):
        pass

    @abstractmethod
    def get_expenses(self, query):
        pass

class TinyDBStorage(StorageStrategy):
    def __init__(self, db_file="expenses_db.json"):
        self.db_path = os.path.join(os.path.dirname(__file__), db_file)

    def add_expense(self, expense: dict):
        with TinyDB(self.db_path) as db:
            expenses_table = db.table('expenses')
            expenses_table.insert(expense)
    
    def get_expenses(self, query):
        with TinyDB(self.db_path) as db:
            expenses_table = db.table('expenses')
            if query:
                return expenses_table.search((Query().id == query) & (Query().state == "pending"))
            return expenses_table.search(Query().state == "pending")

    def cancel_pending_expenses(self):
        with TinyDB(self.db_path) as db:
            expenses_table = db.table('expenses')
            expenses_table.update({'state': 'finished'}, Query().state == 'pending')
