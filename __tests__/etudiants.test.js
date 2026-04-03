const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Etudiant = require("../models/Etudiant");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Etudiant.deleteMany({});
});

// Données valides réutilisables
const etudiantValide = {
  nom: "Dupont",
  prenom: "Alice",
  email: "alice@test.com",
  filiere: "Informatique", // ✅ valeur exacte du enum
  annee: 2,
  moyenne: 15,
};

describe("GET /api/etudiants", () => {
  test("retourne un tableau vide si aucun étudiant", async () => {
    const res = await request(app).get("/api/etudiants");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0); // ✅ getAllEtudiants retourne un tableau direct
  });

  test("retourne tous les étudiants", async () => {
    await Etudiant.create([
      { ...etudiantValide, email: "alice@test.com" },
      {
        ...etudiantValide,
        nom: "Martin",
        prenom: "Bob",
        email: "bob@test.com",
      },
    ]);
    const res = await request(app).get("/api/etudiants");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2); // ✅ tableau direct
  });
});

describe("POST /api/etudiants", () => {
  test("crée un étudiant et retourne 201", async () => {
    const res = await request(app).post("/api/etudiants").send(etudiantValide);

    expect(res.statusCode).toBe(201);
    expect(res.body.nom).toBe("Dupont");
    expect(res.body._id).toBeDefined();
  });

  test("retourne 400 si le nom est manquant", async () => {
    const res = await request(app)
      .post("/api/etudiants")
      .send({ prenom: "Alice", moyenne: 15 });

    expect(res.statusCode).toBe(400);
  });

  test("retourne 400 si la moyenne est négative", async () => {
    const res = await request(app)
      .post("/api/etudiants")
      .send({ ...etudiantValide, moyenne: -5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test("retourne 400 si la moyenne dépasse 20", async () => {
    const res = await request(app)
      .post("/api/etudiants")
      .send({ ...etudiantValide, moyenne: 25 });

    expect(res.statusCode).toBe(400);
  });

  test("retourne 400 si la moyenne n'est pas un nombre", async () => {
    const res = await request(app)
      .post("/api/etudiants")
      .send({ ...etudiantValide, moyenne: "bonne" });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/etudiants/:id", () => {
  test("retourne l'étudiant correspondant", async () => {
    const etudiant = await Etudiant.create(etudiantValide);
    const res = await request(app).get(`/api/etudiants/${etudiant._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.nom).toBe("Dupont"); // ✅ getById retourne { success, data }
  });

  test("retourne 404 pour un ID inexistant", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/etudiants/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  test("retourne 400 pour un ID mal formaté", async () => {
    const res = await request(app).get("/api/etudiants/pas-un-id-valide");
    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /api/etudiants/:id", () => {
  test("met à jour un étudiant", async () => {
    const etudiant = await Etudiant.create(etudiantValide);
    const res = await request(app)
      .put(`/api/etudiants/${etudiant._id}`)
      .send({ moyenne: 17 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.moyenne).toBe(17); // ✅ updateEtudiant retourne { success, data }
    expect(res.body.data.nom).toBe("Dupont");
  });

  test("retourne 404 si l'étudiant n'existe pas", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/etudiants/${fakeId}`)
      .send({ moyenne: 17 });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /api/etudiants/:id", () => {
  test("supprime l'étudiant et retourne 200", async () => {
    const etudiant = await Etudiant.create(etudiantValide);
    const res = await request(app).delete(`/api/etudiants/${etudiant._id}`);

    expect(res.statusCode).toBe(200);
    // ✅ soft delete : l'objet existe encore en base (pas supprimé physiquement)
    const enBase = await Etudiant.findById(etudiant._id);
    expect(enBase).not.toBeNull();
  });

  test("retourne 404 si l'étudiant n'existe pas", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/etudiants/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});
