#!/usr/bin/env bash
docker build -t danger89/crypto-bot-father -t registry.melroy.org/melroy/crypto-bot-father/crypto-bot-father:latest .

# Publish to both GitLab Registry and Docker Hub
docker push danger89/crypto-bot-father:latest
docker push registry.melroy.org/melroy/crypto-bot-father/crypto-bot-father:latest
