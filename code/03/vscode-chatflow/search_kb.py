from typing import List
from promptflow import tool
from promptflow.connections import CognitiveSearchConnection

from azure.core.credentials import AzureKeyCredential  
from azure.search.documents import SearchClient  
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.models import Vector  


@tool
def search_kb(questionvector: List[float],cogconn: CognitiveSearchConnection) -> str:

  search_client = SearchClient(cogconn.api_base, 'promptindex', credential=AzureKeyCredential(cogconn.api_key))  
  vector = Vector(value=questionvector, k=3, fields="ContentVector") 
    
  results = search_client.search(  
      search_text=None,  
      vectors=[vector],
      select=["KB", "Content"],
  )  
  
  result_item = ''

  for result in results:  
      result_item = result['Content']
      break

  return result_item
