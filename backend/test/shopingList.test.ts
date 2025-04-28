

import supertest from "supertest";
import app, { generateToken } from '../app'; // Path to your Express app


const superTestInstance = supertest(app);

describe("shoppingList route", () => {
    let token: string;
    beforeAll(() => {
        const user = { id: '123', policies: ['policy1', 'policy2'] };
        token = generateToken(user);
    });

    describe("get list endpoint", () => {
        const invalidListId = "115d506291fc132601f439dc";
        describe("given the unauthorized user", () => {
            it("should return a 401", async () => {
                await superTestInstance
                    .get(`/list/get/${invalidListId}`)
                    .expect(401)

            })
        })
        describe("given the list doesnt exist", () => {
            it("should return a 404", async () => {
                const listId = "115d506291fc132601f439dc"
                await superTestInstance
                    .get(`/list/get/${listId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(404)

            })
        })
        describe("given the list exists", () => {
            it("should return a 200 with the expected object", async () => {
                const listId = "675d506291fc132601f439dc";
                const expectedResponse = {
                    "_id": "675d506291fc132601f439dc",
                    "name": "Makro nákup dva",
                    "ownerId": "123",
                    "createdEpoch": 1734168674,
                    "numberOfUncheckedItems": 0,
                    "errorMap": {}
                };

                await superTestInstance
                    .get(`/list/get/${listId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .expect((res) => {
                        const { updatedEpoch, membersIdList, ...rest } = res.body;
                        expect(rest).toEqual(expectedResponse);
                        expect(typeof updatedEpoch).toBe('number');
                        expect(typeof membersIdList).toBe('object');
                    });
            });
        })
    })

    describe("get all list endpoint", () => {
        describe("given a bad request", () => {
            it("should return a 400 with errorMap", async () => {
                const requestBody = {
                    // Missing required fields to trigger validation error
                };

                const response = await superTestInstance
                    .post('/list/getAll')
                    .set('Authorization', `Bearer ${token}`)
                    .send(requestBody)
                    .expect('Content-Type', /json/)
                    .expect(400);

                const { errorMap } = response.body;
                expect(typeof errorMap).toBe("object");
                expect(Object.hasOwn(errorMap, "invalidDtoIn")).toBe(true);
            });
        });

        describe("given a correct request", () => {
            it("should return a 200 with the expected object", async () => {
                const requestBody = {
                    order: "desc",
                    pageInfo: {
                        pageIndex: 0,
                        pageSize: 20
                    }
                };

                const response = await superTestInstance
                    .post('/list/getAll')
                    .set('Authorization', `Bearer ${token}`)
                    .send(requestBody)
                    .expect('Content-Type', /json/)
                    .expect(200);

                const { lists, pageInfo } = response.body;
                // Check pageInfo types
                expect(typeof pageInfo.pageIndex).toBe('number');
                expect(typeof pageInfo.pageSize).toBe('number');
                expect(typeof pageInfo.total).toBe('number');

                // Check lists array
                expect(Array.isArray(lists)).toBe(true);
                lists.forEach((list: any) => {
                    expect(typeof list._id).toBe('string');
                    expect(typeof list.name).toBe('string');
                    expect(typeof list.ownerId).toBe('string');
                    expect(Array.isArray(list.membersIdList)).toBe(true);
                    expect(typeof list.createdEpoch).toBe('number');
                    expect(typeof list.updatedEpoch).toBe('number');
                    expect(typeof list.numberOfUncheckedItems).toBe('number');
                });
            });
        });
    })

    describe("create list endpoint", () => {
        describe("given a name shorter than 5 characters", () => {
            it("should return a 400 with invalidDtoIn error", async () => {
                const requestBody = {
                    "name": "abc"
                };

                const response = await superTestInstance
                    .post('/list/create')
                    .set('Authorization', `Bearer ${token}`)
                    .send(requestBody)
                    .expect('Content-Type', /json/)
                    .expect(400);

                const { errorMap } = response.body;
                expect(typeof errorMap).toBe("object");
                expect(Object.hasOwn(errorMap, "invalidDtoIn")).toBe(true);
            });
        });

        describe("given a valid request", () => {
            it("should successfully create the list and return the expected object", async () => {
                const requestBody = {
                    "name": "Další nákup pro dva"
                };

                const response = await superTestInstance
                    .post('/list/create')
                    .set('Authorization', `Bearer ${token}`)
                    .send(requestBody)
                    .expect('Content-Type', /json/)
                    .expect(201);

                const { _id, name, ownerId, membersIdList, createdEpoch, updatedEpoch, numberOfUncheckedItems, errorMap } = response.body;

                expect(typeof _id).toBe('string');
                expect(name).toBe(requestBody.name);
                expect(typeof ownerId).toBe('string');
                expect(Array.isArray(membersIdList)).toBe(true);
                expect(membersIdList.length).toBe(0);
                expect(typeof createdEpoch).toBe('number');
                expect(typeof updatedEpoch).toBe('number');
                expect(numberOfUncheckedItems).toBe(0);
                expect(typeof errorMap).toBe('object');
            });
        });
    })

    describe("delete list endpoint", () => {
        describe("given the list doesn't exist", () => {
            it("should return a 404 error", async () => {
                const requestBody = {
                    id: "675d70668a7bf7a4b730b14a"
                };

                const response = await superTestInstance
                    .post('/list/delete')
                    .set('Authorization', `Bearer ${token}`)
                    .send(requestBody)
                    .expect('Content-Type', /json/)
                    .expect(404);

                const { errorMap } = response.body;
                expect(typeof errorMap).toBe("object");
                expect(Object.hasOwn(errorMap, "404")).toBe(true);
            });
        });

        describe("given a valid request to delete an existing list", () => {
            it("should successfully delete the list and return a 202 status", async () => {
                // First, create a list to delete
                const createRequestBody = {
                    "name": "Další nákup nákup dva"
                };

                const createResponse = await superTestInstance
                    .post('/list/create')
                    .set('Authorization', `Bearer ${token}`)
                    .send(createRequestBody)
                    .expect('Content-Type', /json/)
                    .expect(201);

                const createdListId = createResponse.body._id;

                // Now, delete the created list
                const deleteRequestBody = {
                    id: createdListId
                };

                // console.log("deleteRquest body: ", deleteRequestBody);

                const deleteResponse = await superTestInstance
                    .post('/list/delete')
                    .set('Authorization', `Bearer ${token}`)
                    .send(deleteRequestBody)
                    .expect('Content-Type', /json/)
                    .expect(202);

                // console.log("delete response body: ", deleteResponse.body)

                const { errorMap } = deleteResponse.body;
                expect(typeof errorMap).toBe("object");
            });
        });
    })

    describe("update list endpoint", () => {
        describe("given an invalid name attribute", () => {
            it("should return a 400 error", async () => {
                const requestBody = {
                    "id": "675d506291fc132601f439dc",
                    "name": 12345 // Invalid name attribute
                };

                const response = await superTestInstance
                    .post('/list/update')
                    .set('Authorization', `Bearer ${token}`)
                    .send(requestBody)
                    .expect('Content-Type', /json/)
                    .expect(400);

                const { errorMap } = response.body;
                expect(typeof errorMap).toBe("object");
                expect(Object.hasOwn(errorMap, "invalidDtoIn")).toBe(true);
            });
        });

        describe("given a valid request", () => {
            it("should successfully update the list and return the expected object", async () => {
                const requestBody = {
                    "id": "675d506291fc132601f439dc",
                    "name": "Makro nákup dva",
                    "membersIdList": ["355d506291fc132601f439ea"]
                };

                const response = await superTestInstance
                    .post('/list/update')
                    .set('Authorization', `Bearer ${token}`)
                    .send(requestBody)
                    .expect('Content-Type', /json/)
                    .expect(200);

                const { _id, name, ownerId, membersIdList, createdEpoch, updatedEpoch, numberOfUncheckedItems, errorMap } = response.body;

                expect(typeof _id).toBe('string');
                expect(name).toBe(requestBody.name);
                expect(typeof ownerId).toBe('string');
                expect(Array.isArray(membersIdList)).toBe(true);
                expect(membersIdList).toContain(requestBody.membersIdList[0]);
                expect(typeof createdEpoch).toBe('number');
                expect(typeof updatedEpoch).toBe('number');
                expect(numberOfUncheckedItems).toBe(0);
                expect(typeof errorMap).toBe('object');
            });
        });
    });
});