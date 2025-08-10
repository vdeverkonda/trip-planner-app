# Gemini AI Models Guide

## Available Models

### 🚀 **Gemini 1.5 Pro** (Recommended)
**Model Name**: `gemini-1.5-pro`

**Best For**: Detailed, personalized itinerary planning with local insights

**Capabilities**:
- ✅ **Complex Reasoning**: Understands complex travel requirements
- ✅ **Detailed Analysis**: Provides comprehensive destination research
- ✅ **Local Knowledge**: Offers authentic local insights and hidden gems
- ✅ **Personalization**: Creates highly tailored experiences
- ✅ **Cultural Context**: Includes cultural and historical information
- ✅ **Practical Tips**: Provides detailed logistics and insider tips

**Use Case**: Perfect for creating detailed, personalized itineraries that feel like they were crafted by a local expert.

**Example Output**:
```
Day 1 - Paris Adventure
- Morning: Visit the Louvre Museum (9:00-11:30)
  Address: Rue de Rivoli, 75001 Paris, France
  Cost: $17 (with advance booking discount)
  Notes: Arrive early to avoid crowds. Skip the line with advance tickets. 
  Don't miss the Mona Lisa in Room 711. Local tip: Visit on Wednesday/Friday 
  for extended evening hours with fewer tourists.
```

---

### ⚡ **Gemini 1.5 Flash** (Balanced)
**Model Name**: `gemini-1.5-flash`

**Best For**: Quick itinerary generation with good quality

**Capabilities**:
- ✅ **Fast Responses**: Quick generation times
- ✅ **Good Reasoning**: Solid understanding of travel planning
- ✅ **Creative Content**: Good activity suggestions
- ⚠️ **Limited Detail**: Less comprehensive local insights
- ⚠️ **Basic Context**: Standard recommendations

**Use Case**: Good for users who want decent quality itineraries quickly.

**Example Output**:
```
Day 1 - Paris
- Morning: Louvre Museum (9:00-11:30)
  Address: Rue de Rivoli, Paris
  Cost: $17
  Notes: Popular museum, book tickets in advance
```

---

### 🏃 **Gemini 1.5 Flash Lite** (Fastest)
**Model Name**: `gemini-1.5-flash-lite`

**Best For**: Basic itinerary generation when speed is priority

**Capabilities**:
- ✅ **Very Fast**: Quickest response times
- ✅ **Basic Planning**: Simple itinerary structure
- ⚠️ **Limited Detail**: Basic activity descriptions
- ⚠️ **Generic Content**: Less personalized recommendations
- ⚠️ **No Local Insights**: Standard tourist information

**Use Case**: Best for basic itinerary generation when you need speed over detail.

**Example Output**:
```
Day 1
- Morning: Visit museum (9:00-11:00)
  Cost: $15
  Notes: Popular attraction
```

## Model Comparison

| Feature | Pro | Flash | Flash Lite |
|---------|-----|-------|------------|
| **Speed** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Detail** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Local Insights** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **Personalization** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Cost** | Highest | Medium | Lowest |

## Configuration

### Environment Setup
Add to your `server/.env` file:

```bash
# AI Configuration
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-1.5-pro  # Choose your preferred model
```

### Model Selection Guide

**Choose Gemini 1.5 Pro if**:
- You want the highest quality itineraries
- You need detailed local insights
- You want personalized recommendations
- You're planning complex trips
- You have budget for premium AI

**Choose Gemini 1.5 Flash if**:
- You want good quality with faster responses
- You need balanced speed and quality
- You're planning standard trips
- You want reasonable costs

**Choose Gemini 1.5 Flash Lite if**:
- Speed is your top priority
- You need basic itinerary structure
- You're on a tight budget
- You're testing the AI features

## API Endpoints

### Get Model Information
```bash
GET /api/trips/ai-model-info
```
Returns current model info and available models.

### Generate Itinerary
```bash
POST /api/trips/:id/ai-itinerary
```
Generates itinerary using the configured model.

## Cost Considerations

- **Pro**: Highest cost, best quality
- **Flash**: Medium cost, good quality
- **Flash Lite**: Lowest cost, basic quality

For most users, **Gemini 1.5 Pro** provides the best value for money due to its superior quality and detailed recommendations.

## Recommendations

### For Production Use
**Use Gemini 1.5 Pro** - Provides the best user experience with detailed, personalized itineraries.

### For Development/Testing
**Use Gemini 1.5 Flash** - Good balance of cost and quality for testing.

### For Budget Constraints
**Use Gemini 1.5 Flash Lite** - Basic functionality at lowest cost.

## Migration Guide

To switch models:

1. Update `GEMINI_MODEL` in your `.env` file
2. Restart the server
3. Test with a new itinerary generation

The app will automatically use the new model for all future itinerary generations.
