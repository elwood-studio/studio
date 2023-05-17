import { Workflow } from '@elwood-studio/workflow-types';

export const unlockKey = 'w09jxyUWyeuXFMg3VH2Y7u/eRDgFAdcyShVmh13cyJ8=';

export const workflow: Workflow  ={
name: 'test',
jobs: {
  'default': {
    steps: [
      {
        "action":"node",
        "input": [
          ""
        ]
      }
    ]
  }
}
}

// export const input = {
//   src: 'transcribe-sample.mp3',
//   __tracking_id: ''
// };

// export const keychain = [
//   "[\"9a4f4f80d9d13cf89cc8\",\"t49CBrXjBslYCF/yMNC4V+/PszyI7lPM4Z0lB+kdlSmM8aHs7/HLCNnGKxtDYPWN:3P2kMPvQGNEyx3ZuHEidZsKAdH0lL3yJ\",\"WCKEAO6Vb5RxxmwaJXYGCobXxsVhbAZR3vXKq4OHjptLbF2PEK/0UOgZZTbFOzx0:auA5wmkxR28TS/92HuYZw96m37AP70lA\"]"
// ];

// export const secrets = [

//             "[\"storage_uri\",\"9a4f4f80d9d13cf89cc8\",\"geVzXYiC8Q7wXjOpx8+WshezAaxt8Mw8Vbl76tuQLUXjryxm043v/h3fluITPMLKCRv1VaxvOWt/Iq6CXuW7FWpRviNz5XPy6N7yL7lBkOaqykLo8oienjiqAoN64p1pKMm6SiMuwwMDMeDzIiA3YMv+gIBrjw3YggmXgGIjowqi5dUHkWascAxYbqpVC40spYUgWzYOGIIPBGE0xrwOW9Qh7GiQY6t/d8almswD/P5HzJqj8PjIVQzLsYNPxpBOeMOOPNA77tFO/F38HHJtonoVaIVxGV96tRTrqx0DqhB6N8nLRbJrdUw7MToRJcbsb2w=\"]",
//             "[\"dropbox_client_id\",\"9a4f4f80d9d13cf89cc8\",\"fed8+6evPI7u7P9gRI0Ea/LAvVtqz0DuGwN5+8zf5k/5ryM3LDxhflY+u8R08s74l6vGZCdAowomYBwtpDqk\"]",
//             "[\"dropbox_client_secret\",\"9a4f4f80d9d13cf89cc8\",\"9MY/K4NdjLVf7VPO+ijCYl7LrxTwyxbLijT9HL5wC0t3CX7ks4pgmzR5CJjOx1r9TSB0Bd8wIxXU9ZwTdi75\"]",
//             "[\"dropbox_token\",\"9a4f4f80d9d13cf89cc8\",\"xNfGQdxHZY42s4Zt8uteSDUlgpvtZl290z05kfuASSO2p4dIhZiB2xiQ5CEhicj45mcfstBo3WmIYTOrLknKrj00BTF8/gHBbBgaqrvN/x6rFtlqEz5s+DYAuEzLN2Ixz9gcwlKrmORLYoscu8KuM/9pTyBSMaORoNkoxAa6EXQGuJ1HqQ8OgEiTYn8YcJSDbgjnQzWrvuCvOslAWyBkXvBGoiGLFfvZ5vpM4jpGnCfMs6QUOUY80pth5w==\"]",
//             "[\"aws_s3_access_key_id\",\"9a4f4f80d9d13cf89cc8\",\"93SzBPCOrnkKu7YukOLVWKnrApNmos1h2bipjWwxWg95o4nGdnNJZWarfPogU1FG5QaH54UKk0uimhEResO5VZjSNIc=\"]",
//             "[\"aws_s3_secret_access_key\",\"9a4f4f80d9d13cf89cc8\",\"+leEzBHOqDw3Pz03WxDH+H/1VlL0cYO34Pg3zefnTnZSWshyr77pIOWavUK1qAemfEuldUkorUszMRWEc0oAu2MXgbxP7UNoXj8iUrAZfGpnwoTml0LKSQ==\"]",
//             "[\"aws_s3_session_token\",\"9a4f4f80d9d13cf89cc8\",\"cVSXVSrjv7uEyKdZl1owF7KkyGqFTnDJnpyt6oek0B4T0HBC8XNtxuAxrVY18hE8kjUfk4z2PI2e4tVIjBApHn1sWm4Ae7EHdB1xXA2cPjgvgqsNxgdwEJzjf4louCRzufubnerKrvyoNrr+lONqUhhSlKGK4nwX4b4o2A/RqUdCxYtM9QSLLqvlAGutrO6n4FaiqwT19c6F28+lbnMU8nngCjIVmjpX0PuLCK6dwnyyarqYJCLIsF7rveYWe0SOtRE6dUAB58xlvR3o0Xe9d9zhgKQ7SMHPHJJfleFrE8FJdFttyAOHVq29g5pLIRpmjtwzARhVSN8PW1zsQq5j/NqgHqOZyIHjDWuGevSiT98uV5FdjCUAQkP03JRcdl75Z9YRmgu54pMIY2TleMvXCxFxDJA0TjG7jxgFFMPdX5+JpxLdHq+eGt5/ekfBhGGiNAqBH1zViSlrCyiJa4fVVQrgZR0feFOaJS3nRz44vFrKDwAVg0pGeviy2frvatSojrs5IExYeqgqXpew7fPvfhs01Yx0dH1q+H9j6Ho8JDuDlD8qH70O4bFltpVqXtmEK67w6w/1KOZBwMJnLx8evpFQm35qIM4876Ja6FY5w2mRTxcjfudIZmMgwRb1AIaulDCmEEZRf/NKdh06inS4F2VDxfMs2ys1d4llz+yUJ7a4lZD7TcSBeDrq74D7Ij8zgUfp3eE8oewKxRanxW0AWgcV2nMsdXXMrKRoMLlkC2kqqf3yGjaooDDpqw3HVvBEoghokmz5F4ePljVg5gpoAgzBc5yGxbdjvByOjX1p7qvkszPEa7GnOdFPna3IfTq1Qnz0NHcM4+NqaIXTwbQ3IawMnAtJQnnV/PdT9ARw6LaCbyqueoabcwN9D+6dPBsLEsnkOKHyOitrkx+kGwxgrY4o/BzKyfxZ1zKHgxb8Bog6WFI554lQsIh8t67AFDcl7tGn57FXyI7fVg/dRf+/4rKCOeK0OTHNUwzr1l12v9jFvNWDu1xJ5CkgA1FgoAHaqT3I5gMs4x6JN3i1OYf93sV2MZr6DfiU6umZwGn0wU5ehRlnR6YfusyIh8C+21Q3/coHJpfPciG2JfM/F9XM84kIKOKkkt8EZO0w4C+Qzj7XV2sreG9p2dSvQfz1xAs69JhsHtC0dRIpKEaIsq44ILk6X7ZsptEOezFptbUIIgneaqUWYktn41A7EvLJWHzLdX0emcBa1kID67N5H1IW0CrLszTadbFpHVKE0TP551Bl+EGp2SZPg5TzS4rr5i9b+cmAyMoleHhX0K5KvHQUomMiKFuBfPSAziZgH9BvQqfEz0aubM4nGbCJ9b+72WQAGmWWpyzC/NcK19x8zTYXY0PqtfjyqgUD5oJ1fvpG1fI/xSDdMI+Wr098k7Oqm922gtcpxgvaxGIHv1Px4Y46PO06PWNXXIBtLRIKPgz13/DLcYZNPzatuRwthXi98HV2FSJ0Dy/s5/2xquzQHXfu6cA8t02nHtIfWAyY4jMN/lMigIStDUjsEuN/9xFlR0QC5L44Htojcs1iM01YzKymeXEWMjfSq3IWWmrrQL2JYYhXme0zo8jqHFbkShxof7wsZmMZqw==\"]",
//             "[\"aws_s3_region\",\"9a4f4f80d9d13cf89cc8\",\"VF+q6PdOeTGLVJJ1fLrTeLlLvc/ZB6TSwJdae0HmsGuxUfoqfZGxcmjNm6+vw3/MDkeCN/WybdQp\"]",
//             "[\"aws_transcribe_access_key_id\",\"9a4f4f80d9d13cf89cc8\",\"ZGSA65kYDPRm+aAApZfs3UpLvkWRvXxEwk5W96U5BgHMN/h5t39bUQzHWIK9y1qnc8B8LL+V7OqCRy4JF2Qcho1r+tQ=\"]",
//             "[\"aws_transcribe_secret_access_key\",\"9a4f4f80d9d13cf89cc8\",\"fFCABUQdbNx9v7JVvR/A9Ln3DTc1HNvErTLeHJomzl0dCxXKx0YskkevQCxLdjchX0zwSlEpY7G6fLU2jreEGLrouiB707z8IP/GfiofXEtO75UdYvEpOw==\"]",
//             "[\"aws_transcribe_session_token\",\"9a4f4f80d9d13cf89cc8\",\"/754W1cN05Bo9uFYUyhKlP5uc3AUrCICjfFTllwSGQHNewQ9hXn0ErEYoXrIYIOktB8EXuqj0tWwBiHrQtrnZvRKmxnof0GyGgMpj0SYuGAD2ZbhqauRlew28fWo7D/qY+l+Ot5N9TGzcdX7uPP6AGYZsOApdn3obhCiyaMGwLyAJcpW/XCQHy6tkqOQTLTQSuJEW7v7Q+AYd8Gm2GkkUnWKQpc/rPEPQKEVVL8QNsxZphTSywlVC54t3Ibar+5/fj5+TX/Tu0SR2AOk/K3oPN+KgLGJlx2xv1b2wpq3DkDD3B38nPR0Y83ZWstegj9Kjuw3mpd1g5bGYm2v7eTyEhuf/6QIjomlVxoAovt/Z0kI5Yrn2+pChlLlSJ0VEmKgOr9ySBG3nmok1ylCFMrdDaOD4DNIqJz/jW93eOL9Ml5/E0LVo9r+bWAcqzen5kAAXzKuUaZMx9TK1WYODU5dHrndlnXFEsH67nHeorHxzQ8LOwXyvNFP46wIeoZG8sb1V3MskCFPm4mpy7sar8MzWi8/AIPt/0ZPItgBCziutMCYeDy/SghpZKiqvpwQNGHNvOciCkJLnw348AgluNkJTxLnCLiotyowgPEMEaFxNxAn2dwcpeaJJgKkTmOJRKUzhQRVa3/1wqJQd7DMFzmAttR8+Vl0gXVUoFUrg7oqiuQXGR850L/A8HRMSxzhRtfd8XWWPn4xQmBX7EEhAwWBIsosQ5ZLKXdGLiLnlZLYIJaD1HdqrWW7M4j8ISKshRzkWVCL0zFdSEP/UjFGercFz9G0CXGVd1NU7PrQ0vWeuIs+4zVuJKUluaUZSLCm7NyyccoAR+A9uehnmpmvimKBiTQtfgNkb4qTH9ZgNQzIYwxq/qwyccItIafx22IZgCBqIb2bpejr1NpMz9tTITnfrzK4zVX+/M469rw3zW2KzVdVIni7waIisyk1cUPg0+27gK0t1in4UDfQ2kYn+2bijuvVA3h62Ykj5DO0qh0M7sVKYrdUxjBtPoThz3xCZ2/EW8erVaPAi8DBjN6jd/IexBL0aM1I5MZGjxO7TX6JyHwoKuWHqP9AulNmtihtysplWv5aRG+8nvutsTKebotlfYABuGhCBiW3jQl46XwMLemvtU7a8YRhnK4jeTWO9Er1ON1ykFiIYaKP3hqmMsiyhk8JWm0UggF80R2lM2ocSHR3abkL4g26+plOCHvkvQq3jyX5uYyMreN0GLC4jfFVECazAqJKtWCRNiN3qZ5aJZV4YDz0VGq6iTajpW+Qy8UjxggALJgqK9IMVZoqQTfNjyqCqrp54JE6TLi6hBx1i5jBgNKvPOnzI173Lc/RFl+lmTA6aS2Qtdt87JqbCnT7DSpW4Dw1hxaCKzpE8TGKbe156LUNjUQx8VnbEtLbqgtjyy68eR5SrVIuFkIQvYqAnvoAxpZEefedM8kdkmdUPZ7yERnCMWrFtFl6UNc=\"]",
//             "[\"aws_transcribe_region\",\"9a4f4f80d9d13cf89cc8\",\"4/vrsoQC0z4ne73W4rs410f5StOMVhwwQi0+A7mqMHHBLtPnElfx3nsTAXyRdfBROrzBD7SwGbSy\"]"
        
// ];

// export const workflow: Workflow = {
//   name: 'db',
//   when: '*',
//   jobs: {
//     default: {
//       steps: [
//         {
//           name: 'get',
//           action: 'dropbox/download.js',
//           input: {
//             src: `{%= input.src %}`,
//             output: 'file',
//           },
//           env: {
//             DROPBOX_CLIENT_ID: '{%= secret("dropbox_client_id") %}',
//             DROPBOX_CLIENT_SECRET: '{%= secret("dropbox_client_secret") %}',
//             DROPBOX_ACCESS_TOKEN: '{%= secret("dropbox_token") %}',
//           },
//         },
//         {
//           action: 'git/clone',
//           input: {
//             url: `{%= secret("storage_uri") %}`,
//             dest: './repo',
//           },
//         },
//         {
//           name: 'storage_file',
//           action: 'storage/path',
//           input: {
//             path: '{%= job.steps.get.output.file.path_lower %}',
//             output: 'path',
//             prefix: './repo',
//             postfix: 'placeholder',
//           },
//         },
//         {
//           name: 'repo_file',
//           action: 'run/script',
//           input: {
//             path: '{%= job.steps.get.output.file.path_lower %}',
//             prefix: 'repo',
//             script: `
//               import {setOutput, getInput} from 'https://raw.githubusercontent.com/elwood-studio/actions/main/core.ts';
//               import { extname, basename, join, dirname } from "https://deno.land/std@0.132.0/path/mod.ts";

//               const path = getInput('path');
//               const prefix = getInput('prefix');

//               await setOutput('path', join(prefix, path));
//             `,
//           },
//         },
//         {
//           action: 'fs/move',
//           input: {
//             src: `{%= job.steps.get.output.file.name %}`,
//             dest: `./{%= job.steps.repo_file.output.path %}`,
//           },
//         },        
//         {
//           action: 'git/add',
//           input: {
//             cwd: './repo',
//           },
//         },
//         {
//           action: 'git/commit',
//           input: {
//             cwd: './repo',
//             message: 'adding {%= job.steps.get.output.file.name %}',
//           },
//         },
//         {
//           action: 'git/push',
//           input: {
//             cwd: './repo',
//             repo: `{%= secret("storage_uri") %}`,
//           },
//         },
//       ],
//     },
//   },
// };
