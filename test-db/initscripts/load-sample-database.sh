#!/bin/bash
set -e

# Load sample database from .tar file
pg_restore -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" /data/dvdrental.tar
