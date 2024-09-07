from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.graph import END, StateGraph 
from langgraph.checkpoint.memory import MemorySaver
from state import AgentState
from typing import List, Literal
from langchain_core.tools import Tool
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from pampa_tools import ExpenseTrackerTool, GETExpenseTrackerTool
from dotenv import load_dotenv
from prompt import AGENT_PROMPT
from jinja2 import Template

load_dotenv()

class Agent:
    def __init__(self, prompt: Template = AGENT_PROMPT, model_name: str = "gpt-4o", tools: List[Tool] = [ExpenseTrackerTool(), GETExpenseTrackerTool()]):
        self._prompt =  prompt
        self._model = ChatOpenAI(model_name=model_name).bind_tools(tools)
        self._tools = tools
        self._build_graph()

    def _call_model(self, state: AgentState) -> dict:
        if not state['messages']:
            return {"messages": [SystemMessage(content=self.prompt.render())]}
        try:
            response = self._model.invoke(state['messages'])
            return {"messages": [response]}
        except Exception as e:
            # Log the error and return an error message
            print(f"Error invoking model: {str(e)}")
            return {"messages": [HumanMessage(content=f"Error: {str(e)}")]}
    
    def _should_continue(self, state: AgentState) -> Literal["tools", END]:
        messages = state['messages']
        last_message = messages[-1]
        
        # If the LLM makes a tool call, then we route to the "tools" node
        if last_message.tool_calls:
            return "tools"
        # Otherwise, we stop (reply to the user)
        return END
    
    def _build_graph(self, ):

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
        workflow.add_edge("tools", 'agent')

        # Set the entry point
        workflow.set_entry_point("agent")

        # Initialize memory to persist state between graph runs
        checkpointer = MemorySaver()

        # Compile the graph
        self._graph = workflow.compile(checkpointer=checkpointer)

    def invoke(self, id, message: str):
        return self._graph.invoke(input={"messages": [HumanMessage(content=message)]}, config={"configurable": {"thread_id": id}})
