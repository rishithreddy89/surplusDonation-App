#!/bin/bash

# Start backend in background
cd backend
npm run dev &

# Start frontend
cd ../frontend
npm run dev
