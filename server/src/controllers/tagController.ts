import type { Request, Response } from "express";

import { createTag, deleteTag, listTags, updateTag } from "../services/tagService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function list(req: Request, res: Response) {
  const result = await listTags(req.user!.id);
  return sendSuccess(res, result);
}

export async function create(req: Request, res: Response) {
  const result = await createTag(req.user!.id, req.body);
  return sendSuccess(res, result, "Tag created", 201);
}

export async function update(req: Request, res: Response) {
  const result = await updateTag(req.user!.id, req.params.id as string, req.body);
  return sendSuccess(res, result, "Tag updated");
}

export async function remove(req: Request, res: Response) {
  const result = await deleteTag(req.user!.id, req.params.id as string);
  return sendSuccess(res, result, "Tag deleted");
}
