import * as server from "@/lib/supabase/server"
import { POST } from "../todos/route"

describe("/api/todos POST", () => {
  beforeAll(() => {
    // Minimal Response polyfill for the Jest environment (node/jest doesn't expose the Web Response)
    if (typeof (global as any).Response === "undefined") {
      ;(global as any).Response = class {
        status: number
        private _body: any
        constructor(body: any, opts: any) {
          this.status = opts?.status ?? 200
          this._body = body
        }
        async json() {
          return JSON.parse(this._body)
        }
      }
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("returns 200 and the created task when text is provided", async () => {
    const mockedClient = {
      from: (table: string) => ({
        insert: (rows: any[]) => ({
          select: async () => ({ data: [{ id: "1", text: rows[0].text }], error: null }),
        }),
      }),
    }

    jest.spyOn(server, "createClient").mockResolvedValue(mockedClient as any)

    const req = { json: async () => ({ text: "Buy milk" }) } as any
    const res = await POST(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ id: "1", text: "Buy milk" })
  })

  it("returns 400 when text is missing", async () => {
    const req = { json: async () => ({}) } as any
    const res = await POST(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty("error")
  })
})
