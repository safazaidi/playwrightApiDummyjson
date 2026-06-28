#!/bin/bash
nl -ba tests/back/api/services/searchProdService.ts | sed -n '1,80p'
