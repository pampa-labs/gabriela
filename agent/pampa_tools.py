from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import List, Dict
import json
import requests
from langchain_core.messages import FunctionMessage
from .storage import StorageStrategy, TinyDBStorage

class TeamMembersTool(BaseTool):
    name = "team"
    description = "Retrieves the current list of team members in the organization."

    def _run(self):
        """Returns a list of team members."""
        team_members = [
            "Petra El Matero",
            "Pancho El gaucho",
            "Lauta El Asador"
        ]
        return ", ".join(team_members)

    def _arun(self):
        """Async implementation of the tool."""
        raise NotImplementedError("TeamMembersTool does not support async")


class Expense(BaseModel):
    person: str
    expense_type: str
    date: str
    total_value: float

class ExpenseTrackerTool(BaseTool):
    name = "expense_tracker"
    description = "Tracks expenses for team members."
    args_schema = Expense
    storage: StorageStrategy = TinyDBStorage()


    def _run(self, person: str, expense_type: str, date: str, total_value: float):
        """Adds a new expense to the tracker."""

        expense = {
            "id": person, #TODO id
            "expense_type": expense_type,
            "date": date,
            "total_value": total_value,
            "state": "pending"
        }

        try:
            self.storage.add_expense(expense)
            return FunctionMessage(name=self.__class__.__name__, content="Expense added successfully")
        except Exception as e:
            return FunctionMessage(name=self.__class__.__name__, content=f"Error adding expense: {str(e)}")

class ExpenseQuery(BaseModel):
    query: str

class GETExpenseTrackerTool(BaseTool):
    name = "get_expenses"
    description = "Retrieves expenses based on a query."
    args_schema = ExpenseQuery
    storage: StorageStrategy = TinyDBStorage()

    def _run(self, query, config):
        """Retrieves expenses based on the provided query."""
        try:
            expenses = self.storage.get_expenses(query['person'])
            expenses_json = json.dumps(expenses, ensure_ascii=False)
            return FunctionMessage(name=self.__class__.__name__, content=expenses_json)
        except Exception as e:
            return FunctionMessage(name=self.__class__.__name__, content=f"Error retrieving expenses: {str(e)}")

class CancelPendingExpensesTool(BaseTool):
    name = "cancel_pending_expenses"
    description = "Cancels all pending expenses."

    def _run(self):
        """Cancels all pending expenses."""
        self.storage.cancel_pending_expenses()
        try:
            self.storage.cancel_pending_expenses()
            return FunctionMessage(name=self.__class__.__name__, content="All pending expenses have been cancelled successfully.")
        except Exception as e:
            return FunctionMessage(name=self.__class__.__name__, content=f"Error cancelling pending expenses: {str(e)}")