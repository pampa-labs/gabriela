import os
from abc import ABC, abstractmethod
from pymongo import MongoClient
from dotenv import load_dotenv
from pymongo.server_api import ServerApi
import json
from bson import json_util

load_dotenv()

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
    def get_out_of_office(self, team_member, date):
        pass

    @abstractmethod
    def cancel_pending_expenses(self):
        pass

class MongoDBStorage(StorageStrategy):
    def __init__(self):
        self.client = None
        self.db = None

    def _connect(self):
        if not self.client:
            mongo_uri = os.getenv('MONGO_URI')
            if not mongo_uri:
                raise ValueError("MONGO_URI environment variable is not set")
            self.client = MongoClient(mongo_uri, server_api=ServerApi('1'))
            try:
                self.client.admin.command('ping')
                print("Successfully connected to MongoDB!")
            except Exception as e:
                print(f"Error connecting to MongoDB: {e}")
                raise
            self.db = self.client['gabriela']

    def add_expense(self, expense: dict):
        self._connect()
        expenses_collection = self.db['expenses']
        expenses_collection.insert_one(expense)

    def get_expenses(self, query=None):
        self._connect()
        expenses_collection = self.db['expenses']
        results = list(expenses_collection.find({'state': 'pending'}))
        return json.dumps(results, default=json_util.default)

    def cancel_pending_expenses(self):
        self._connect()
        expenses_collection = self.db['expenses']
        expenses_collection.update_many({'state': 'pending'}, {'$set': {'state': 'finished'}})

    def add_meal(self, meal: dict):
        self._connect()
        meals_collection = self.db['meals']
        meals_collection.insert_one(meal)

    def get_meals(self, query=None):
        self._connect()
        meals_collection = self.db['meals']

        results = list(meals_collection.find({}))
        return json.dumps(results, default=json_util.default)

    def add_out_of_office(self, out_of_office: dict):
        self._connect()
        out_of_office_collection = self.db['out_of_office']
        out_of_office_collection.insert_one(out_of_office)

    def get_out_of_office(self, team_member=None, date=None):
        self._connect()
        out_of_office_collection = self.db['out_of_office']
        query = {}
        if team_member:
            query['team_member'] = team_member
        if date:
            query['date'] = date
        results = list(out_of_office_collection.find(query))
        return json.dumps(results, default=json_util.default)