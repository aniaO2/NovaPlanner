namespace Organizer.Server.Services;
using MongoDB.Driver;

public class MongoDBService
{
    private readonly IMongoDatabase _database;

    public MongoDBService()
    {
        // Replace with your MongoDB connection string
        var connectionString = "mongodb://localhost:27017"; // For local MongoDB

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase("OrganizerDb");
    }

    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }
}

