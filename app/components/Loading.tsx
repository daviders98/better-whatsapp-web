import React from 'react'
import { CircularProgress } from '@mui/material';
import Image from 'next/image';

function Loading() {
  return (
    <center style={{ display: "grid", placeItems: "center", height: "100vh" }}>
            <div style={{width:"200px"}}>
                <Image
                    loading="eager"
                    src="/images/logo.png"
                    alt="logo"
                    style={{ marginBottom: 8}}
                    height={200}
                    width={200}
                />
                <CircularProgress
                    style={{ 'color': '#34b6f8',width:"60px",height:"60px" }}
                />
            </div>
        </center>
  )
}

export default Loading