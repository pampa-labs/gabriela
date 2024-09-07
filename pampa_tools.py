from langchain.tools import BaseTool
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

# Create an instance of the tool
team_tool = TeamMembersTool()