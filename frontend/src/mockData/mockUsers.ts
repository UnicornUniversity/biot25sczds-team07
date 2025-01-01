export type UserType = {
    id: string,
    role: "ADMIN" | "MEMBER",
    name: string,
    surname: string,
    profile_pick_path: string | null, // TODO
    password: string,
    userName: string,
}

export const users: UserType[] = [
    {
        id: "1",
        role: "ADMIN",
        name: "Alice",
        surname: "Johnson",
        profile_pick_path: null, // Replace with an actual path or URL
        password: "securePass123!",
        userName: "alice.johnson",
    },
    {
        id: "2",
        role: "MEMBER",
        name: "Bob",
        surname: "Smith",
        profile_pick_path: null, // Replace with an actual path or URL
        password: "bobSecret456#",
        userName: "bob.smith",
    },
    {
        id: "3",
        role: "MEMBER",
        name: "Charlie",
        surname: "Brown",
        profile_pick_path: null, // Replace with an actual path or URL
        password: "charlieP@ss789",
        userName: "charlie.brown",
    },
    {
        id: "4",
        role: "ADMIN",
        name: "Diana",
        surname: "Miller",
        profile_pick_path: null, // Replace with an actual path or URL
        password: "diana!Power321",
        userName: "diana.miller",
    },
    {
        id: "5",
        role: "MEMBER",
        name: "Eve",
        surname: "Taylor",
        profile_pick_path: null, // Replace with an actual path or URL
        password: "eTaylor@2023",
        userName: "eve.taylor",
    },
    {
        id: "6",
        role: "MEMBER",
        name: "Frank",
        surname: "Williams",
        profile_pick_path: null, // Replace with an actual path or URL
        password: "frankWill#987",
        userName: "frank.williams",
    },
];
