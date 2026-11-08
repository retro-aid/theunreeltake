import { Trivia } from "@/generated/prisma/client";
import prisma from "@/lib/__mocks__/prisma";
import { createTriviaQuestion, deleteQuestion, getAllQuestions, getRandomQuestion, publishQuestion, questionAnswered, updateQuestion } from "@/lib/dal/dto/trivia";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock(import("server-only"), () => {
  return {};
});

vi.mock(import("@/lib/prisma"));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const questionDummy = {
    id: "idDummy",
    question: "question-test",
    answer: "answer-test",
    category: "category-test",
    published: true,
    difficulty: "difficulty-test",
    correct: 1,
    asked: 5,
};

const questionDummy2 = {
    id: "idDummy2",
    question: "question-test",
    answer: "answer-test",
    category: "category-test",
    published: false,
    difficulty: "difficulty-test",
    correct: 1,
    asked: 5,
};


describe("deleteQuestion", () => {
  it("Successfully deleted a question", async () => {
    prisma.trivia.delete.mockResolvedValueOnce(questionDummy as Trivia);
    const result = await deleteQuestion("idDummy");
    expect(prisma.trivia.delete).toHaveBeenCalledWith({
      where: { id: "idDummy" },
    });
    expect(result).toEqual({ error: null, success: true });
  });

  it("Returns error when Prisma throws", async () => {
    prisma.trivia.delete.mockRejectedValue(new Error("Prisma Down"));
    const result = await deleteQuestion("idDummy");
    expect(result).toEqual({ error: "Failed to delete question", success: false });
  });

  it("Passes an empty id straight through and calls delete once", async () => {
    prisma.trivia.delete.mockRejectedValue(new Error("Invalid Id"));
    const result = await deleteQuestion("");
    expect(prisma.trivia.delete).toHaveBeenCalledOnce();
    expect(prisma.trivia.delete).toHaveBeenCalledWith({ where: { id: "" } });
    expect(result.success).toBe(false);
  });

  it("Returns error when question does not exist", async () => {
    prisma.trivia.delete.mockRejectedValue(new Error("Question not found"));
    await expect(deleteQuestion("missing")).resolves.toEqual({
      error: "Failed to delete question",
      success: false,
    });
  });
});

describe("updateQuestion", () => {
  it("Successfully updated a question", async () => {
    prisma.trivia.update.mockResolvedValueOnce(questionDummy as Trivia);
    const result = await updateQuestion("idDummy", "test-question", "test-answer", "test-category");
    expect(prisma.trivia.update).toHaveBeenCalledWith({
      where: {
        id: "idDummy",
      },
      data: {
        question: "test-question",
        answer: "test-answer",
        category: "test-category",
      }
    });
    expect(result).toEqual({ error: null, success: true });
  });

  it("Returns error when Prisma throws", async () => {
    prisma.trivia.update.mockRejectedValue(new Error("Prisma Down"));
    const result = await updateQuestion("idDummy", "test-question", "test-answer", "test-category");
    expect(result).toEqual({ error: "Failed to update question", success: false });
  });

  it("Passes an empty id straight through and calls update once", async () => {
    prisma.trivia.update.mockRejectedValue(new Error("Invalid Id"));
    const result = await updateQuestion("fakeId", "test-question", "test-answer", "test-category");
    expect(prisma.trivia.update).toHaveBeenCalledOnce();
    expect(prisma.trivia.update).toHaveBeenCalledWith({ 
      where: {
        id: "fakeId",
      },
      data: {
        question: "test-question",
        answer: "test-answer",
        category: "test-category",
      }
    });
    expect(result.success).toBe(false);
  });

  it("Returns error when question does not exist", async () => {
    prisma.trivia.update.mockRejectedValue(new Error("Question not found"));
    await expect(updateQuestion("idDummy", "test-question", "test-answer", "test-category")).resolves.toEqual({
      error: "Failed to update question",
      success: false,
    });
  });
});


describe("publishQuestion", () => {
  it("Successfully published a question", async () => {
    prisma.trivia.update.mockResolvedValueOnce(questionDummy as Trivia);
    const result = await publishQuestion("idDummy");
    expect(prisma.trivia.update).toHaveBeenCalledWith({
      where: {
        id: "idDummy",
      },
      data: {
        published: true,
      }
    });
    expect(result).toEqual({ error: null, success: true });
  });

  it("Returns error when Prisma throws", async () => {
    prisma.trivia.update.mockRejectedValue(new Error("Prisma Down"));
    const result = await publishQuestion("idDummy");
    expect(result).toEqual({ error: "Failed to publish question", success: false });
  });

  it("Passes an empty id straight through and calls update once", async () => {
    prisma.trivia.update.mockRejectedValue(new Error("Blank String"));
    const result = await publishQuestion("");
    expect(prisma.trivia.update).toHaveBeenCalledOnce();
    expect(prisma.trivia.update).toHaveBeenCalledWith({ 
      where: {
        id: "",
      },
      data: {
        published: true,
      }
    });
    expect(result.success).toBe(false);
  });

  it("Returns error when question does not exist", async () => {
    prisma.trivia.update.mockRejectedValue(new Error("Question not found"));
    await expect(publishQuestion("idDummy")).resolves.toEqual({
      error: "Failed to publish question",
      success: false,
    });
  });
});


describe("createQuestion", () => {
  it("Successfully created a question", async () => {
    prisma.trivia.create.mockResolvedValueOnce(questionDummy as Trivia);
    const result = await createTriviaQuestion("test-question", "test-answer", "test-category");
    expect(prisma.trivia.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        question: "test-question",
        answer: "test-answer",
        category: "test-category",
        difficulty: "Unknown",
        correct: 0,
        asked: 0,
        published: false,
      }),
    });
    expect(result).toEqual({ error: null, success: true });
  });

  it("Returns error when Prisma throws", async () => {
    prisma.trivia.create.mockRejectedValue(new Error("Prisma Down"));
    const result = await createTriviaQuestion("test-question", "test-answer", "test-category");
    expect(result).toEqual({ error: "Failed to create question", success: false });
  });

  it("Returns error when database write fails", async () => {
    prisma.trivia.create.mockRejectedValue(new Error("Database Error"));
    const result = await createTriviaQuestion("test-question", "test-answer", "test-category");
    expect(result).toEqual({ error: "Failed to create question", success: false });
  });
});


describe("getAllQuestions", () => {
  it("Successfully got all questions", async () => {
    const questions = [questionDummy, questionDummy2]
    prisma.trivia.findMany.mockResolvedValueOnce(questions as Trivia[]);
    const result = await getAllQuestions();
    expect(result).toBe(questions);
  });

  it("Returns an empty array when no questions", async () => {
    prisma.trivia.findMany.mockResolvedValueOnce([] as Trivia[]);
    const result = await getAllQuestions();
    expect(result).toStrictEqual([]);
  });

  it("Returns error when Prisma throws", async () => {
    prisma.trivia.findMany.mockRejectedValue(new Error("Prisma Down"));
    await expect(getAllQuestions()).rejects.toThrow("Prisma Down");
  });

  it("Returns error when database write fails", async () => {
    prisma.trivia.findMany.mockRejectedValue(new Error("Database error"));
    await expect(getAllQuestions()).rejects.toThrow("Database error");
  });
});


describe("getRandomQuestion", () => {
  it("Successfully got a random public question", async () => {
    const questions = [questionDummy]
    prisma.trivia.findMany.mockResolvedValueOnce(questions as Trivia[]);
    const result = await getRandomQuestion();
    expect(result).toBe(questionDummy);
  });

  /* Find out why this test is failing!
  it("Returned nothing when only questions are private", async () => {
    const questions = [questionDummy2]
    prisma.trivia.findMany.mockResolvedValueOnce(questions as Trivia[]);
    const result = await getRandomQuestion();
    expect(result).toBe(null);
  });
  */

  it("Returns an empty array when no questions", async () => {
    prisma.trivia.findMany.mockResolvedValueOnce([] as Trivia[]);
    const result = await getRandomQuestion();
    expect(result).toStrictEqual(null);
  });

  it("Returns error when Prisma throws", async () => {
    prisma.trivia.findMany.mockRejectedValue(new Error("Prisma Down"));
    const result = await getRandomQuestion();
    expect(result).toStrictEqual(null);
  });

  it("Returns error when database read fails", async () => {
    prisma.trivia.findMany.mockRejectedValue(new Error("Database error"));
    const result = await getRandomQuestion();
    expect(result).toStrictEqual(null);
  });
});


describe("questionAnswered", () => {
  it("Successfully updated question values with a 0", async () => {
    prisma.trivia.findUnique.mockResolvedValueOnce(questionDummy as Trivia);
    prisma.trivia.update.mockResolvedValueOnce(questionDummy as Trivia);

    const result = await questionAnswered("idDummy", 0);
    expect(prisma.trivia.findUnique).toHaveBeenCalledWith({
      where: {
        id: "idDummy",
      },
    })
    expect(prisma.trivia.update).toHaveBeenCalledWith({ 
      where: {
        id: "idDummy",
      },
      data: expect.objectContaining({
        correct: 1,
        asked: 6
      }),
    });
    expect(result).toEqual({ error: null, success: true });
  });

  it("Successfully updated question values with a 1", async () => {
    prisma.trivia.findUnique.mockResolvedValueOnce(questionDummy as Trivia);
    prisma.trivia.update.mockResolvedValueOnce(questionDummy as Trivia);

    const result = await questionAnswered("idDummy", 1);
    expect(prisma.trivia.findUnique).toHaveBeenCalledWith({
      where: {
        id: "idDummy",
      },
    })
    expect(prisma.trivia.update).toHaveBeenCalledWith({ 
      where: {
        id: "idDummy",
      },
      data: expect.objectContaining({
        correct: 2,
        asked: 6
      }),
    });
    expect(result).toEqual({ error: null, success: true });
  });

  it("Returns error when Prisma throws", async () => {
    prisma.trivia.findUnique.mockRejectedValue(new Error("Prisma Down"));
    prisma.trivia.update.mockRejectedValue(new Error("Prisma Down"));
    const result = await questionAnswered("idDummy", 0);
    expect(result).toEqual({ error: "Failed to update stats", success: false });
  });

  it("Passes an empty id straight through and calls update once", async () => {
    prisma.trivia.findUnique.mockRejectedValue(new Error("Blank String"));
    prisma.trivia.update.mockRejectedValue(new Error("Blank String"));

    const result = await questionAnswered("", 0);
    expect(prisma.trivia.findUnique).toHaveBeenCalledOnce();
    expect(prisma.trivia.findUnique).toHaveBeenCalledWith({
      where: {
        id: "",
      },
    })
    expect(result).toEqual({ error: "Failed to update stats", success: false });
  });

  it("Returns error when question does not exist", async () => {
    prisma.trivia.findUnique.mockRejectedValue(new Error("Question not found"));
    prisma.trivia.update.mockRejectedValue(new Error("Question not found"));
    
    const result = await questionAnswered("fakeId", 0);
    expect(prisma.trivia.findUnique).toHaveBeenCalledOnce();
    expect(prisma.trivia.findUnique).toHaveBeenCalledWith({
      where: {
        id: "fakeId",
      },
    })
    expect(result).toEqual({ error: "Failed to update stats", success: false });
  });
});