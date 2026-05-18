# Karigar.ai

**Har Karigar, Ek Click Dur**

Karigar.ai is a Progressive Web Application prototype for Pakistan's informal service economy. It uses an AI-powered seven-agent workflow to turn a natural language service request into a confirmed booking with provider matching, scheduling, pricing, tracking, feedback, and dispute resolution.

## Overview

This project is a PWA submission for AI Seekho 2026. It is designed to help users easily find and book local service workers like electricians, plumbers, AC technicians, mechanics, and tutors using multilingual text and voice input.

## Key Features

- Multilingual input handling (Urdu, Roman Urdu, English)
- AI-driven request parsing and clarification
- Provider ranking with match scoring and risk screening
- Scheduling with conflict detection and alternative slot suggestions
- Dynamic pricing with transparent breakdown and budget alternatives
- Booking simulation with lifecycle tracking and reminders
- Feedback-driven reputation updates
- Dispute resolution workflow with escalation rules
- Offline-readiness for app shell and saved data

## Architecture

Karigar.ai is built as a single-file PWA with the following layers:

- App Shell: `index.html`, `style.css`, `app.js`
- PWA support: `manifest.json`, `sw.js`
- Mock data: `providers.json`
- AI orchestration: Gemini API and Google Antigravity prompt design
- Local storage: persistent user data, booking state, and trace logs

## Technology Stack

- HTML5, CSS3, Vanilla JavaScript
- Progressive Web App (service worker, manifest)
- Google Fonts
- Web Speech API for voice input
- Gemini 2.0 Flash API for AI reasoning
- Google Antigravity for agent orchestration
- LocalStorage for persistence

## Repository Structure

- `Karigar-Ai.md` — Full system design document
- `README.md` — Project overview and usage guide
- `manifest.json` — PWA metadata and install configuration
- `sw.js` — Offline caching and service worker logic
- `providers.json` — Mock provider dataset
- `assets/` — Icons and branding assets
- `docs/` — Architecture and trace documentation

## How to Use

1. Open the project in a modern browser.
2. Load `index.html`.
3. Provide a service request using text or voice.
4. Follow the AI-driven booking flow through provider selection, scheduling, pricing, and tracking.

## Deployment

This prototype can be deployed as a static PWA on services like Netlify. For a production-ready deployment, move the Gemini API key to a secure server-side proxy or environment variable.

## Testing Plan

The design document includes several test scenarios, including:

- Happy path booking flow
- Low confidence input clarification
- No provider available fallback
- Scheduling conflict handling
- Price dispute resolution
- Urdu script parsing
- Provider cancellation and reassignment

## Notes

- All provider data is mock data.
- Notifications, SMS, and payment flows are simulated.
- The current prototype stores data in `localStorage`.
- The Gemini API key should not remain client-side in a production application.
