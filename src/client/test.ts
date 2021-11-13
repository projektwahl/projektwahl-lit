import type { Task } from "@lit-labs/task/task.js";

const task: Task = undefined!;

const test: number = task.render({
  complete: () => 1
})