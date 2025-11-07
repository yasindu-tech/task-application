"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Task = {
  id?: number
  title: string
  completed?: boolean
}

export default function TasksPage() {
  
    return (<div>Tasks Page</div>)  
  
}
