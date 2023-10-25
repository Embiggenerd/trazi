package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"
)

func requestWorker(id int, jobs <-chan int, results chan<- float64, method, url string) {
	for j := range jobs {
		reqBody := []byte(fmt.Sprint(j))
		bodyReader := bytes.NewReader(reqBody)
		req, _ := http.NewRequest(method, url, bodyReader)
		req.Header.Set("content-type", "text/plain")
		client := http.Client{
			Timeout: 30 * time.Second,
		}
		start := time.Now()
		res, _ := client.Do(req)
		defer res.Body.Close()
		_, _ = io.ReadAll(res.Body)
		secs := time.Since(start).Seconds()
		results <- secs
	}
}

func doRequests(method, url string) string {
	const numJobs = 500
	const numWorkers = numJobs / 50
	start := time.Now()
	jobs := make(chan int, numJobs)
	results := make(chan float64, numJobs)
	for w := 1; w <= numWorkers; w++ {
		go requestWorker(w, jobs, results, method, url)
	}
	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs)
	sum := 0.0
	for a := 1; a <= numJobs; a++ {
		sum = sum + <-results
	}
	avgSum := sum / numJobs
	return fmt.Sprintf("%.4f seconds elapsed running %d concurrent %s requests, with %.4f average second pe request\n", time.Since(start).Seconds(), numJobs, method, avgSum)
}

func main() {
	getOutout := doRequests(http.MethodGet, "http://127.0.0.1:5555/api/population/state/Florida/city/Miami")
	putOutput := doRequests(http.MethodPut, "http://127.0.0.1:5555/api/population/state/Florida/city/Miami")

	fmt.Println(getOutout)
	fmt.Println(putOutput)
}
