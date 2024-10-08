from typing import Any, Dict, List, Literal, Optional

from dotenv import load_dotenv
from jinja2 import Template
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode

from .pampa_tools import tools_list
from .prompt import AGENT_PROMPT
from .state import AgentState

load_dotenv()


class Agent:
    def __init__(
        self,
        prompt: Template = AGENT_PROMPT,
        model_name: str = "gpt-4o",
        tools: List[Tool] = tools_list,
    ):
        self._prompt = prompt
        self._model = ChatOpenAI(model_name=model_name).bind_tools(tools)
        self._tools = tools
        self._build_graph()

    def _call_model(self, state: AgentState) -> dict:
        if not state["messages"] or not isinstance(state["messages"][0], SystemMessage):
            state["messages"].insert(0, SystemMessage(content=self._prompt))
        try:
            response = self._model.invoke(state["messages"])
            return {"messages": [response]}
        except Exception as e:
            # Log the error and return an error message
            print(f"Error invoking model: {str(e)}")
            return {"messages": [HumanMessage(content=f"Error: {str(e)}")]}

    def _should_continue(self, state: AgentState) -> Literal["tools", END]:
        messages = state["messages"]
        last_message = messages[-1]

        # If the LLM makes a tool call, then we route to the "tools" node
        if last_message.tool_calls:
            return "tools"
        # Otherwise, we stop (reply to the user)
        return END

    def _build_graph(self):

        tool_node = ToolNode(self._tools)

        # Create the graph
        workflow = StateGraph(AgentState)

        # Add nodes
        workflow.add_node("agent", self._call_model)
        workflow.add_node("tools", tool_node)
        workflow.add_conditional_edges(
            # First, we define the start node. We use `agent`.
            # This means these are the edges taken after the `agent` node is called.
            "agent",
            # Next, we pass in the function that will determine which node is called next.
            self._should_continue,
        )

        # Add edges
        workflow.add_edge("tools", "agent")

        # Set the entry point
        workflow.set_entry_point("agent")

        # Initialize memory to persist state between graph runs
        checkpointer = MemorySaver()

        # Compile the graph
        self._graph = workflow.compile(checkpointer=checkpointer)

    def invoke(self, id, message: str, image_url: Optional[str] = None):
        content: List[Dict[str, Any]] = [{"type": "text", "text": message}]
        if image_url:
            content.append({"type": "image_url", "image_url": image_url})
        return self._graph.invoke(
            input={"messages": [HumanMessage(content=content)]},
            config={"configurable": {"thread_id": id}},
        )
