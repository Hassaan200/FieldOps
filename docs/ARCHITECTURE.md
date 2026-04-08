# FieldOps — Architecture Document

## Overview

Three layer architecture — React frontend, Express REST API, MySQL database.
All communication is JSON over HTTP. Auth is handled via JWT passed in the
Authorization header on every request.

## System Components