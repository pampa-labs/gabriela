import json
import logging
from datetime import date
from typing import Any, Dict, List, Optional, Tuple, Union

import requests
from bson import json_util
from langchain.schema.runnable import RunnableConfig
from langchain_core.messages import FunctionMessage, ToolCall
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field

from .expenses_storage import MongoDBStorage, StorageStrategy


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
    args_schema: type[Expense] = Expense
    storage: StorageStrategy = MongoDBStorage()

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
    storage: StorageStrategy = MongoDBStorage()

    def _run(self, query, config):
        """Retrieves expenses based on the provided query."""
        try:
            expenses = self.storage.get_expenses(self.person_id)
            expenses_json = json.loads(expenses)
            return FunctionMessage(
                name=self.__class__.__name__,
                content=json.dumps(expenses_json, ensure_ascii=False),
            )
        except Exception as e:
            return FunctionMessage(
                name=self.__class__.__name__,
                content=f"Error retrieving expenses: {str(e)}",
            )


class CancelPendingExpensesTool(BaseTool):
    name: str = "cancel_pending_expenses"
    description: str = "Cancels all pending expenses."
    storage: StorageStrategy = MongoDBStorage()

    def _run(self):
        """Cancels all pending expenses."""
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


class MealPlan(BaseModel):
    """
    Represents a meal plan for a specific date.
    """

    meal: str = Field(description="The name of the meal.")
    date: str = Field(description="The date of the meal plan.")
    toppings: Optional[List[str]] = Field(
        default=None, description="Optional list of toppings for the meal."
    )
    team_member: str = Field(
        description="The team member who set the meal plan. If not provided by the user, the agent needs to ask for it. 'Assistant' cannot be a team member."
    )


class SetMealTool(PampaBaseTool):
    name: str = "set_meal"
    description: str = (
        "Sets the meal plan for a specific date with optional toppings and the team member who set it."
    )
    args_schema: type[MealPlan] = MealPlan
    storage: StorageStrategy = MongoDBStorage()

    def _run(
        self,
        meal: str,
        date: str,
        team_member: str,
        toppings: Optional[List[str]] = None,
    ):
        """Sets the meal plan for a specific date."""
        meal_plan = MealPlan(
            meal=meal, date=date, toppings=toppings, team_member=team_member
        )

        try:
            self.storage.add_meal(meal_plan.model_dump())
            return FunctionMessage(
                name=self.__class__.__name__,
                content=f"Meal plan for {date} set successfully by {team_member}",
            )
        except Exception as e:
            return FunctionMessage(
                name=self.__class__.__name__,
                content=f"Error setting meal plan: {str(e)}",
            )


class GetMealsTool(PampaBaseTool):
    name: str = "get_meals"
    description: str = "Retrieves meal plans based on a date query."
    storage: StorageStrategy = MongoDBStorage()

    def _run(self, date: Optional[str] = None):
        """Retrieves meal plans based on the provided date query."""
        try:
            meals = self.storage.get_meals(date)
            meals_json = json.loads(meals)
            return FunctionMessage(
                name=self.__class__.__name__,
                content=json.dumps(meals_json, ensure_ascii=False),
            )
        except Exception as e:
            return FunctionMessage(
                name=self.__class__.__name__,
                content=f"Error retrieving meal plans: {str(e)}",
            )


class CannotGoToOfficeIRL(BaseModel):
    """
    Represents a date when a team member cannot go to the office in real life (IRL).
    """

    team_member: str = Field(
        description="The name of the team member who cannot go to the office IRL."
    )
    date: str = Field(
        description="The date when the team member cannot go to the office IRL (format: YYYY-MM-DD)."
    )
    reason: Optional[str] = Field(
        default=None,
        description="Optional reason for not being able to go to the office IRL.",
    )


class SetCannotGoToOfficeIRLTool(PampaBaseTool):
    name: str = "set_cannot_go_to_office_irl"
    description: str = "Sets a date when a team member cannot go to the office IRL."
    args_schema: type[CannotGoToOfficeIRL] = CannotGoToOfficeIRL
    storage: StorageStrategy = MongoDBStorage()

    def _run(self, team_member: str, date: str, reason: Optional[str] = None):
        """Sets a date when a team member cannot go to the office IRL."""
        cannot_go_to_office_irl = CannotGoToOfficeIRL(
            team_member=team_member, date=date, reason=reason
        )

        try:
            self.storage.add_out_of_office(cannot_go_to_office_irl.model_dump())
            return FunctionMessage(
                name=self.__class__.__name__,
                content=f"Date set for {team_member} who cannot go to the office IRL on {date}",
            )
        except Exception as e:
            return FunctionMessage(
                name=self.__class__.__name__,
                content=f"Error setting date for cannot go to office IRL: {str(e)}",
            )


class GetCannotGoToOfficeIRLTool(PampaBaseTool):
    name: str = "get_cannot_go_to_office_irl"
    description: str = "Retrieves dates when team members cannot go to the office IRL."
    storage: StorageStrategy = MongoDBStorage()

    def _run(self, team_member: Optional[str] = None, date: Optional[str] = None):
        """Retrieves dates when team members cannot go to the office IRL based on the provided query."""
        try:
            logging.debug(
                f"Querying cannot go to office IRL with team_member: {team_member}, date: {date}"
            )
            cannot_go_to_office_irl = self.storage.get_out_of_office(team_member, date)
            logging.debug(
                f"Retrieved cannot go to office IRL entries: {cannot_go_to_office_irl}"
            )
            response_json = json.loads(cannot_go_to_office_irl)
            return FunctionMessage(
                name=self.__class__.__name__,
                content=json.dumps(response_json, ensure_ascii=False),
            )
        except Exception as e:
            logging.error(f"Error retrieving cannot go to office IRL dates: {str(e)}")
            return FunctionMessage(
                name=self.__class__.__name__,
                content=f"Error retrieving cannot go to office IRL dates: {str(e)}",
            )


# List of all tools in the file (excluding base tools)
tools_list = [
    ExpenseTrackerTool(),
    GETExpenseTrackerTool(),
    CancelPendingExpensesTool(),
    SetMealTool(),
    GetMealsTool(),
    SetCannotGoToOfficeIRLTool(),
    GetCannotGoToOfficeIRLTool(),
]
