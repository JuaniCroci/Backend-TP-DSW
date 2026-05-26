import {Router } from "express";
import { sanitizeUsuarioInput, findAll, findONE, add, update, remove } from "./Usuario.controller.js";

export const usuarioRouter = Router()

usuarioRouter.get('/', findAll)
usuarioRouter.get('/:id', findONE)
usuarioRouter.post('/', sanitizeUsuarioInput, add)
usuarioRouter.put('/:id', sanitizeUsuarioInput, update)
usuarioRouter.patch('/:id', sanitizeUsuarioInput, update)
usuarioRouter.delete('/:id', remove)