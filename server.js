import getAnswers from "./getAnswers.js";
import cors from "cors";
import express from "express";

const app = express(cors());

app.get("/get-answers", (req, res) => {
  const answers = getAnswers(req.query.length, req.query.letters).reduce(
    (acc, answer, index, totalArray) => {
      if (index === 0 || answer[0].length !== totalArray[index - 1][0].length) {
        acc = acc + `-----  ${answer[0].length}  -----<br>`;
      }
      acc = acc + answer[0] + "<br>" + answer[1] + "<br>";
      return acc;
    },
    ""
  );
  res.send(`<p>${answers}</p>`);
});

app.listen(process.env.PORT || 80);
