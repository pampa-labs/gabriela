import json
from typing import Any, Dict, List, Optional, Tuple, Union

import requests
from langchain.schema.runnable import RunnableConfig
from langchain_core.messages import FunctionMessage, ToolCall
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field

from .expenses_storage import StorageStrategy, TinyDBStorage


class PampaBaseTool(BaseTool):
    person_id: int = None

    def _prep_run_args(
        self,
        input: Union[str, dict, ToolCall],
        config: Optional[RunnableConfig],
        **kwargs: Any,
    ) -> Tuple[Union[str, Dict], Dict]:
        tool_call_id = input.get("id")
        tool_input = input.get("args").copy()
        return (
            tool_input,
            dict(
                callbacks=config.get("callbacks"),
                tags=config.get("tags"),
                metadata=config.get("metadata"),
                run_name=config.get("run_name"),
                run_id=config.pop("run_id", None),
                config=config,
                tool_call_id=tool_call_id,
                **kwargs,
            ),
        )

    def invoke(
        self,
        input: Union[str, Dict, ToolCall],
        config: Optional[RunnableConfig] = None,
        **kwargs: Any,
    ) -> Any:
        tool_input, kwargs = self._prep_run_args(input, config, **kwargs)
        self.person_id = config.get("metadata", {}).get("thread_id")
        return self.run(tool_input, **kwargs)


class Expense(BaseModel):
    person: str
    expense_type: str
    date: str
    total_value: float


class ExpenseTrackerTool(PampaBaseTool):
    name: str = "expense_tracker"
    description: str = "Tracks expenses for team members."
    args_schema: type = Expense
    storage: StorageStrategy = TinyDBStorage()

    def _run(self, person: str, expense_type: str, date: str, total_value: float):
        """Adds a new expense to the tracker."""

        expense = {
            "id": self.person_id,
            "expense_type": expense_type,
            "date": date,
            "total_value": total_value,
            "state": "pending",
        }

        try:
            self.storage.add_expense(expense)
            return FunctionMessage(
                name=self.__class__.__name__, content="Expense added successfully"
            )
        except Exception as e:
            return FunctionMessage(
                name=self.__class__.__name__, content=f"Error adding expense: {str(e)}"
            )


class GETExpenseTrackerTool(PampaBaseTool):
    name: str = "get_expenses"
    description: str = "Retrieves expenses based on a query."
    storage: StorageStrategy = TinyDBStorage()

    def _run(self, query, config):
        """Retrieves expenses based on the provided query."""
        try:
            expenses = self.storage.get_expenses(self.person_id)
            expenses_json = json.dumps(expenses, ensure_ascii=False)
            return FunctionMessage(name=self.__class__.__name__, content=expenses_json)
        except Exception as e:
            return FunctionMessage(
                name=self.__class__.__name__,
                content=f"Error retrieving expenses: {str(e)}",
            )


class CancelPendingExpensesTool(BaseTool):
    name: str = "cancel_pending_expenses"
    description: str = "Cancels all pending expenses."

    def _run(self):
        """Cancels all pending expenses."""
        self.storage.cancel_pending_expenses()
        try:
            self.storage.cancel_pending_expenses()
            return FunctionMessage(
                name=self.__class__.__name__,
                content="All pending expenses have been cancelled successfully.",
            )
        except Exception as e:
            return FunctionMessage(
                name=self.__class__.__name__,
                content=f"Error cancelling pending expenses: {str(e)}",
            )
