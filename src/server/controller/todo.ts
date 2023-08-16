import { HttpNotFoundError } from "@server/infra/errors";
import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";

async function get(req: NextApiRequest, res: NextApiResponse) {
	const query = req.query;
	const page = Number(query.page);
	const limit = Number(query.limit);

	if (query.page && isNaN(page)) {
		res.status(400).json({
			error: {
				message: "Page must be a number",
			},
		});
	}

	if (query.limit && isNaN(limit)) {
		res.status(400).json({
			error: {
				message: "Limit must be a number",
			},
		});
	}

	const output = await todoRepository.get({
		page,
		limit,
	});
	res.status(200).json(output);
}

const TodoCreateBodySchema = schema.object({
	content: schema.string(),
});

async function create(req: NextApiRequest, res: NextApiResponse) {
	const body = TodoCreateBodySchema.safeParse(req.body);

	if (!body.success) {
		res.status(400).json({
			error: {
				message: "You need to provide a content to create a TODO",
				description: body.error,
			},
		});
		return;
	}

	try {
		const createdTodo = await todoRepository.createByContent(body.data.content);
		res.status(201).json({
			todo: createdTodo,
		});
	} catch {
		res.status(400).json({
			error: {
				message: "Failed to create TODO",
			},
		});
	}
}

async function toggleDone(req: NextApiRequest, res: NextApiResponse) {
	const todoId = req.query.id;

	if (!todoId || typeof todoId !== "string") {
		res.status(400).json({
			error: {
				message: "You must to provide a string ID",
			},
		});
		return;
	}

	try {
		const updatedTodo = await todoRepository.toggleDone(todoId);

		res.status(200).json({
			todo: updatedTodo,
		});
	} catch (error) {
		if (error instanceof Error) {
			res.status(404).json({
				error: {
					message: error.message,
				},
			});
		}
	}
}

async function deleteById(req: NextApiRequest, res: NextApiResponse) {
	const querySchema = schema.object({
		id: schema.string().uuid().nonempty(),
	});

	const parsedQuery = querySchema.safeParse(req.query);

	if (!parsedQuery.success) {
		res.status(400).json({
			error: {
				message: `You must to providade a valid id`,
			},
		});
		return;
	}

	try {
		const todoId = parsedQuery.data.id;
		await todoRepository.deleteById(todoId);
		res.status(204).end();
	} catch (err) {
		if (err instanceof HttpNotFoundError)
			return res.status(err.status).json({
				error: {
					message: err.message,
				},
			});
	}

	res.status(500).json({
		error: {
			message: `Internal server error`,
		},
	});
}

export const todoController = {
	get,
	create,
	toggleDone,
	deleteById,
};
