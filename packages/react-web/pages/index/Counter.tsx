import React, { useState } from 'react'

export { Counter }

function Counter() {

  const [count, setCount] = useState(0)
  return (
    <button type="button" onClick={() => setCount((count) => count + 2)}>
      Counter {count}
    </button>
  )
}
