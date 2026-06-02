const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// 1. Generate Question Paper PDF
const doc1 = new PDFDocument();
doc1.pipe(fs.createWriteStream(path.join(__dirname, '../Backend/public/uploads/sample_exam_questions.pdf')));

doc1.fontSize(20).text('Computer Science - Midterm Exam', { align: 'center' });
doc1.moveDown();
doc1.fontSize(12).text('Instructions: Answer all questions. Total marks: 20.');
doc1.moveDown();

doc1.fontSize(14).text('Question 1 (5 Marks)');
doc1.fontSize(12).text('Explain the difference between a process and a thread in an operating system.');
doc1.moveDown(2);

doc1.fontSize(14).text('Question 2 (5 Marks)');
doc1.fontSize(12).text('Describe the concept of virtual memory and how it works.');
doc1.moveDown(2);

doc1.fontSize(14).text('Question 3 (10 Marks)');
doc1.fontSize(12).text('Write a Python function to perform a binary search on a sorted list of integers.');

doc1.end();

// 2. Generate Answer Key PDF
const doc2 = new PDFDocument();
doc2.pipe(fs.createWriteStream(path.join(__dirname, '../Backend/public/uploads/sample_exam_answer_key.pdf')));

doc2.fontSize(20).text('Computer Science - Midterm Answer Key', { align: 'center' });
doc2.moveDown();

doc2.fontSize(14).text('Answer 1');
doc2.fontSize(12).text('A process is an executing instance of an application with its own memory space. A thread is a path of execution within a process that shares the memory space of the process.');
doc2.moveDown();

doc2.fontSize(14).text('Answer 2');
doc2.fontSize(12).text('Virtual memory is a memory management technique that provides an "idealized abstraction of the storage resources that are actually available on a given machine" which "creates the illusion to users of a very large (main) memory". It relies on swapping data between RAM and disk.');
doc2.moveDown();

doc2.fontSize(14).text('Answer 3');
doc2.fontSize(12).text(`def binary_search(arr, low, high, x):
    if high >= low:
        mid = (high + low) // 2
        if arr[mid] == x:
            return mid
        elif arr[mid] > x:
            return binary_search(arr, low, mid - 1, x)
        else:
            return binary_search(arr, mid + 1, high, x)
    else:
        return -1`);

doc2.end();

console.log("PDFs generated successfully in Backend/public/uploads!");
