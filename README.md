# Transcription Service

## Overview

This is an internal service used to transcribe audio and video files supplied by
core Auvid app.

The project runs locally using ExpressJS but will likely be hosted in a AWS
Lambda instance.

### Stack

- Node v18.12.1
- OPENAI WHISPER API
- AWS SDK
- AWS Lambda
- AWS API Gateway
- AWS Secret Manager
