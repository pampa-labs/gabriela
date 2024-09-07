from typing import TypedDict, Annotated, List
from langchain_core.messages import BaseMessage
from operator import add


class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add]

