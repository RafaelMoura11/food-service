<?php

test('a aplicação responde à rota de health-check', function () {
    $this->get('/up')->assertStatus(200);
});
