import logging
import os
from abc import ABC, abstractmethod
from typing import Optional

from tinydb import Query, TinyDB


class StorageStrategy(ABC):
    @abstractmethod
    def add_expense(self, expense: dict):
        pass

    @abstractmethod
    def get_expenses(self, query):
        pass

    @abstractmethod
    def add_meal(self, meal: dict):
        pass

    @abstractmethod
    def get_meals(self, query):
        pass

    @abstractmethod
    def add_out_of_office(self, out_of_office: dict):
        pass

    @abstractmethod
    def get_out_of_office(self, team_member: Optional[str], date: Optional[str]):
        pass


class TinyDBStorage(StorageStrategy):
    def __init__(self, db_file="expenses_db.json"):
        self.db_path = os.path.join(os.path.dirname(__file__), db_file)

    def add_expense(self, expense: dict):
        with TinyDB(self.db_path) as db:
            expenses_table = db.table("expenses")
            expenses_table.insert(expense)

    def get_expenses(self, query):
        with TinyDB(self.db_path) as db:
            expenses_table = db.table("expenses")
            if query:
                return expenses_table.search(
                    (Query().id == query) & (Query().state == "pending")
                )
            return expenses_table.search(Query().state == "pending")

    def cancel_pending_expenses(self):
        with TinyDB(self.db_path) as db:
            expenses_table = db.table("expenses")
            expenses_table.update({"state": "finished"}, Query().state == "pending")

    def add_meal(self, meal: dict):
        with TinyDB(self.db_path) as db:
            meals_table = db.table("meals")
            meals_table.insert(meal)

    def get_meals(self, query):
        with TinyDB(self.db_path) as db:
            meals_table = db.table("meals")
            if query:
                return meals_table.search(Query().date == query)
            return meals_table.all()

    def add_out_of_office(self, out_of_office: dict):
        with TinyDB(self.db_path) as db:
            out_of_office_table = db.table("out_of_office")
            out_of_office_table.insert(out_of_office)

    def get_out_of_office(self, team_member: Optional[str], date: Optional[str]):
        with TinyDB(self.db_path) as db:
            out_of_office_table = db.table("out_of_office")
            query = Query()

            # Log the current state of the table
            logging.debug(f"Current out_of_office entries: {out_of_office_table.all()}")

            if team_member and date:
                result = out_of_office_table.search(
                    (query.team_member == team_member) & (query.date == date)
                )
            elif team_member:
                result = out_of_office_table.search(query.team_member == team_member)
            elif date:
                result = out_of_office_table.search(query.date == date)
            else:
                result = out_of_office_table.all()

            logging.debug(f"Query result: {result}")
            return result
