import { Router } from 'express';
const router = Router();
// Stub routes for payments module
router.get('/', (req, res) => res.json({ success: true, data: [] }));
router.get('/:id', (req, res) => res.json({ success: true, data: { id: req.params.id } }));
router.post('/', (req, res) => res.status(201).json({ success: true, data: { id: 'new' } }));
router.patch('/:id', (req, res) => res.json({ success: true, data: { id: req.params.id, ...req.body } }));
router.delete('/:id', (req, res) => res.status(204).send());
export default router;
