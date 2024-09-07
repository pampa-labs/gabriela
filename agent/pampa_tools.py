from langchain.tools import BaseTool
from pydantic import BaseModel
from typing import List
import json
import requests
from langchain_core.messages import FunctionMessage
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
    persona: str
    tipo_gasto: str
    fecha: str
    valor_total: float

class ExpenseTrackerTool(BaseTool):
    name = "expense_tracker"
    description = "Tracks expenses for team members."
    args_schema = Expense
    URL = "https://hook.us2.make.com/jnvfsmjcyj5vpws40cw00f13polugkla"

    def _run(self, persona: str, tipo_gasto: str, fecha: str, valor_total: float):
        """Adds a new expense to the tracker."""

        data = json.dumps({
            "persona": persona,
            "tipo_gasto": tipo_gasto,
            "fecha": fecha,
            "valor_total": valor_total
        })

        """Sends a POST request to the webhook endpoint."""
        response = requests.post(self.URL, data=data, headers={'Content-Type': 'application/json'})
        return {"messages": FunctionMessage(name=self.__class__.__name__, content=f"Webhook response: {response.status_code} - {response.text}")}
    
class ExpenseQuery(BaseModel):
    query: str

class GETExpenseTrackerTool(BaseTool):
    name = "get_expenses"
    description = "Retrieves expenses based on a query."
    args_schema = ExpenseQuery
    URL = "https://hook.us2.make.com/wfmhytz9iyo2mfm8fev7bwp1n3sp1tf7"

    def _run(self, query: str):
        """Retrieves expenses based on the provided query."""
        response = requests.get(f"{self.URL}?text={query}")
        return {"messages": FunctionMessage(name=self.__class__.__name__, content=f"Webhook response: {response.status_code} - {response.text}")}
